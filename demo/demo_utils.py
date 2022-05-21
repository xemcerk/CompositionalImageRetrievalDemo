from pymilvus import (
    connections,
    FieldSchema, CollectionSchema, DataType,
    Collection,
)
import pickle
import os
import json
import random

from demo_config import (   
    MILVUS_HOST, 
    MILVUS_PORT, 
    COLLECTION_NAME, 
    OPT_PATH, 
    VAL_PRED_PATH,
    METRIC_TYPE,
    NPROBE,
    ROOT_DIR
)

os.chdir(ROOT_DIR)

from main import create_model_and_optimizer
from datasets.datasets import load_dataset
from test_retrieval import compute_db_features, compute_query_features



def get_milvus_collection(collection_name=COLLECTION_NAME):
    connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
    return Collection(collection_name)


def create_fashioniq_collection():
    collection = get_milvus_collection()

    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
        FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=512)
    ]
    schema = CollectionSchema(
        fields=fields, description="composed image retrieval demo schema")
    collection = Collection(name="fashioniq", schema=schema)

    collection.create_partition("val")
    collection.create_partition("test")

    assert collection.has_partition("val") == True
    assert collection.has_partition("test") == True


def get_preserved_opt():
    with open(OPT_PATH, 'rb') as f:
        opt = pickle.load(f)
    return opt


def get_val_preds():
    preds = []
    for file in os.listdir(VAL_PRED_PATH):
        with open(os.path.join(VAL_PRED_PATH, file)) as f:
            preds += json.load(f)
    return preds


class DemoCTX:
    def __init__(self) -> None:
        self.opt = get_preserved_opt()
        self.dataset_dict = load_dataset(self.opt)
        self.model, _ = create_model_and_optimizer(self.opt,
                                                   self.dataset_dict["train"].get_all_texts())
        self.preds = get_val_preds()
        self.collection = get_milvus_collection()

    def recompute_db_features_into_milvus(self):
        all_imgs, all_captions = compute_db_features(
            self.opt, self.model, testset=self.dataset_dict['val'])
        data = [
            [cap for cap in all_captions],
            [img for img in all_imgs]
        ]
        self.collection.insert(data=data, partition_name='val')

        all_imgs_test, all_captions_test = compute_db_features(
            self.opt, self.model, testset=self.dataset_dict['test'])
        data_test = [
            [cap for cap in all_captions_test],
            [img for img in all_imgs_test]
        ]
        self.collection.insert(data=data_test, partition_name='test')

    def generate_a_random_query(self):
        _num2split = {
            0: 'train',
            1: 'val',
            2: 'test'
        }
        testset = self.dataset_dict[_num2split[random.randint(1, 2)]]
        test_query = testset.test_queries[random.randint(
            0, len(testset.test_queries))]

        return testset, test_query

    def perform_a_query_with_milvus(self, split, test_query):
        computed_queries = compute_query_features(opt=self.opt,
                                                  model=self.model,
                                                  testset=self.dataset_dict[split],
                                                  test_queries=[test_query])
        self.collection.load()
        search_params = {"metric_type": METRIC_TYPE, "params": {"nprobe": NPROBE}}
        results = self.collection.search(
            data=computed_queries.tolist(),
            anns_field="embeddings",
            param=search_params,
            limit=100,
            expr=None,
            consistency_level="Strong",
            partition_names=[split]
        )
        candidates = [self.dataset_dict[split].id2asin[id] for id in results[0].ids]
        scores = [round(d, 3) for d in results[0].distances]
        
        return candidates, scores