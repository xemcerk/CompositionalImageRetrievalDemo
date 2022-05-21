import { Row, Col, Layout } from 'antd';
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";

const { Header, Footer, Sider, Content } = Layout;

import PreComputeRetrievePage from './routes/preComputeRetrieve'
import RealTimeRetrievePage from './routes/realTimeRetrieve';

import './App.css'

function PageNavigator() {
  return (
    <div>
      <nav
        style={{
          // borderBottom: "solid 1px",
          paddingBottom: "1rem",
          paddingTop: "0.5rem"
        }}
      >
        <Link to="/preComputeRetrieve">Precomputed Result</Link> |{" "}
        <Link to="/realTimeRetrieve">Real Time Retrieval</Link>
      </nav>
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <Layout>
        <Header >
          <Row justify="center">
            <Col span={8}>
              <div className='title'>
                <h1 style={{ color: "white", textAlign: "center" }}>Composed Image Retrieval Demo</h1>
              </div>
            </Col>
          </Row>
        </Header>
        <Content>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PageNavigator />}>
                <Route path="preComputeRetrieve" element={<PreComputeRetrievePage />} />
                <Route path="realTimeRetrieve" element={<RealTimeRetrievePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Content>
        <Footer style={{ textAlign: 'center' }}>©2022 Created by Shi Li</Footer>
      </Layout>
    </div>
  )
}

export default App
