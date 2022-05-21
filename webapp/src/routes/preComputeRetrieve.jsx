import { Button, Card, Col, Divider, Image, List, Row } from 'antd';
import 'antd/dist/antd.min.css';
import axios from 'axios';
import React from "react";
import DEFAULTS from './constants/defaults';
import HOSTS from './constants/hosts';
import './global.css';
import RetrieveResultList from './retrieveResultList';


const getPred = async () => {
  return await axios.get(HOSTS.RETRIEVAL_API_HOST + "get_pred").then(res => res.data);
}

class ModStrRow extends React.Component {
  render() {
    return (
      <div className='mod-str'>
        <Row style={{ justifyContent: "space-between" }}>
          <div className='mod-text'>
            <b>Modification Text: </b>{this.props.modStr}
          </div>
        </Row>
      </div>
    );
  }
}

function RefTgtImgRow(props) {
  return (
    <Row align='middile' justify="space-around">
      <Col span={4}>
        <Card title={"Reference Image"} style={{ width: 240 }}>
          <Image
            width={200}
            src={props.refImg}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card title={"Target Image"} style={{ width: 240 }}>
          <Image
            width={200}
            src={props.tgtImg}
          />
        </Card>
      </Col>
    </Row>
  )
}

class PreComputeRetrievePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refImg: HOSTS.COS_IMAGE_HOST + DEFAULTS.DEFAULTS_REF_IMG + ".jpg",
      tgtImg: HOSTS.COS_IMAGE_HOST + DEFAULTS.DEFAULTS_TGT_IMG + ".jpg",
      modStr: DEFAULTS.DEFAULTS_MOD_STR,
      candidates: [],
      scores: []
    }
    this.replaceQuery = this.replaceQuery.bind(this);
  };

  replaceQuery() {
    getPred().then((pred) => {
      console.log(pred)
      const tgtFlag = pred["candidates"].map((candidate, i) => {
        return (candidate === pred["tgt_img"] ? 1 : 0)
      })
      console.log(tgtFlag)
      this.setState({
        refImg: HOSTS.COS_IMAGE_HOST + pred["ref_img"] + ".jpg",
        tgtImg: HOSTS.COS_IMAGE_HOST + pred["tgt_img"] + ".jpg",
        modStr: pred["mod_str"],
        candidates: pred["candidates"],
        scores: pred["scores"],
        tgtFlag: tgtFlag
      })
    })
  }

  render() {
    return (
      <div className='ref-tgt-img'>
        <RefTgtImgRow refImg={this.state.refImg} tgtImg={this.state.tgtImg} />
        <Row justify="center">
          <div className='replace-button'>
            <Button type="primary" onClick={this.replaceQuery} >Replace Query</Button>
          </div>
        </Row>
        <Divider />
        <ModStrRow modStr={this.state.modStr} />
        <Divider />
        <RetrieveResultList candidates={this.state.candidates} scores={this.state.scores} tgtFlag={this.state.tgtFlag} />
      </div>
    );
  }
}

export default PreComputeRetrievePage;