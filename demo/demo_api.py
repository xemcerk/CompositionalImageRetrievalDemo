import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from demo_utils import DemoCTX

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

demo_ctx = DemoCTX()


@app.get("/get_pred")
async def get_pred():
    pred = demo_ctx.preds[random.randint(0, len(demo_ctx.preds))]

    for query in demo_ctx.dataset_dict['val'].test_queries:
        if query["source_img_id"] == demo_ctx.dataset_dict['val'].asin2id[pred["candidate"]]:
            mod_str = query["mod"]["str"]
            tgt_img_id = query["target_img_id"]
            tgt_img_asin = demo_ctx.dataset_dict['val'].id2asin[tgt_img_id]

    return {
        "ref_img": pred["candidate"],
        "tgt_img": tgt_img_asin,
        "candidates": pred["ranking"],
        "scores": pred["scores"],
        "mod_str": mod_str
    }


@app.get("/get_a_random_query")
async def get_a_random_ref_img():
    testset, test_query = demo_ctx.generate_a_random_query()

    return {
        'ref_img': testset.id2asin[test_query['source_img_id']],
        'mod_str': test_query['mod']['str'],
        'split': testset.split
    }


@app.get("/inference")
async def inference(ref_img, mod_str, split):
    test_query = {
        'source_img_id': demo_ctx.dataset_dict[split].asin2id[ref_img],
        'mod': {'str': mod_str}
    }
    candidates, scores = demo_ctx.perform_a_query_with_milvus(split, test_query)

    return {
        "ref_img": ref_img,
        "candidates": candidates,
        "scores": scores,
        "mod_str": mod_str
    }
