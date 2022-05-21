import { Button, Card, Divider, Image, Input, Row } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import DEFAULTS from './constants/defaults';
import HOSTS from './constants/hosts';
import './global.css';
import RetrieveResultList from './retrieveResultList';

const { Search } = Input;

function RefImgRow(props) {
  return (
    <Row justify='center' style={{ marginTop: "1rem" }}>
      <div>
        <Card title={"Reference Image"} style={{ width: 240 }}>
          <Image
            width={200}
            src={props.refImg}
          />
        </Card>
      </div>
    </Row>
  )
}

const getARandomQuery = async () => {
  return await axios.get(HOSTS.RETRIEVAL_API_HOST + "get_a_random_query").then(res => res.data);
}

const getInferenceResult = async (refImgAsin, currentModStr, split) => {
  return await axios.get(HOSTS.RETRIEVAL_API_HOST + "inference?" +
    "ref_img=" + refImgAsin + "&" +
    "mod_str=" + currentModStr + "&" +
    "split=" + split
  ).then(res => res.data);
}

function RealTimeRetrievePage() {
  const [refImgAsin, setRefImgAsin] = useState(DEFAULTS.DEFAULTS_REF_IMG);
  const [refImgURL, setRefImgURL] = useState(HOSTS.COS_IMAGE_HOST + DEFAULTS.DEFAULTS_REF_IMG + ".jpg");
  const [modStr, setModStr] = useState(DEFAULTS.DEFAULTS_MOD_STR);
  const [currentModStr, setCurrentModStr] = useState(DEFAULTS.DEFAULTS_MOD_STR);
  const [split, setSplit] = useState(DEFAULTS.DEFAULTS_SPLIT);
  const [candidates, setCandidates] = useState([]);
  const [scores, setScores] = useState([]);

  const tgtFlag = Array(100).map(() => 0)

  function _replaceQuery() {
    getARandomQuery().then((query) => {
      setRefImgAsin(query.ref_img)
      setRefImgURL(HOSTS.COS_IMAGE_HOST + query.ref_img + ".jpg")
      setModStr(query.mod_str)
      setCurrentModStr(query.mod_str)
      setSplit(query.split)
      console.log(currentModStr)
    })
  }

  function _retrieveImages(value) {
    if (value) {
      setCurrentModStr(value)
    } else {
      setCurrentModStr(modStr)
    }
    console.log(currentModStr)
    getInferenceResult(refImgAsin, currentModStr, split).then((inferenceResult) => {
      console.log(inferenceResult)
      setCandidates(inferenceResult.candidates)
      setScores(inferenceResult.scores)
    })
  }

  return (
    <div>
      <RefImgRow refImg={refImgURL} />
      <Row justify="center" style={{ marginTop: "1rem" }}>
        <div className='replace-button'>
          <Button type="primary" onClick={_replaceQuery} >Replace Query</Button>
        </div>
      </Row>
      <Divider />
      <Row justify='center'>
        <Search
          placeholder={modStr}
          allowClear
          enterButton="retrieve images"
          size="large"
          style={{ width: "80%" }}
          onSearch={_retrieveImages}
        />
      </Row>
      <Divider />
      <RetrieveResultList candidates={candidates} scores={scores} tgtFlag={tgtFlag} />
    </div>
  );
}

export default RealTimeRetrievePage;