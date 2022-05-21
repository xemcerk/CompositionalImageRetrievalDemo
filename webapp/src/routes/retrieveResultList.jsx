import { Card, Image, List } from 'antd';
import HOSTS from './constants/hosts';

function RetrieveResultList(props) {
    const listItems = props.candidates.map((candidate, i) => {
      return {
        index: i + 1,
        img_src: HOSTS.COS_IMAGE_HOST + candidate + ".jpg",
        score: props.scores[i],
        tgtFlag: props.tgtFlag[i]
      };
    })
  
    return (
      <div className='retrieve-result' justify="space-around">
        <List
          grid={{ gutter: 8 }}
          dataSource={listItems}
          renderItem={item => (
            <List.Item>
              <Card title={"Candidate Image " + item.index} style={{ width: 240, border: item.tgtFlag ? "5px solid red" : "" }} hoverable={true} headStyle={{}}>
                <Image
                  width={200}
                  src={item.img_src}
                />
                <div className='img-desc'>
                  <b>score: </b>{item.score}
                </div>
              </Card>
            </List.Item>
          )}
        // pagination={true}
        />
      </div>
    )
}

export default RetrieveResultList;