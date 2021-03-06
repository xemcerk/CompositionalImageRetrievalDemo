# Copyright 2021 Yahoo, Licensed under the terms of the Apache License, Version 2.0.
# See LICENSE file in project root for terms.

python main.py \
    --dataset=fashioniq \
    --dataset_path="/home/lishi/workspace/fashion_iq/start_kit/data/" \
    --num_iters=150000 \
    --model=sequence_concat_attention \
    --savedir=./experiments/fashioniq/ \
    --image_model_arch=resnet50 \
    --learning_rate_decay_frequency=50000 \
    --exp_name=sequence_concat_attention \
    --text_model_arch=lstm \
    --pretrained_weight_lr_factor_text=1.0 \
    --pretrained_weight_lr_factor_image=0.1 \
    --att_layer_spec=34 \
    --number_attention_blocks=2 \
    --width_per_attention_block=128 \
    --sequence_concat_img_through_attn \
    --sequence_concat_include_text \
    --resolutionwise_pool \
    --loader_num_workers=0 \
    --loss=batch_based_classification