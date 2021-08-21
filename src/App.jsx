import { useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import Layout, { Content } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { message } from 'antd';
import 'antd/dist/antd.css'
import './App.css';
import { parseZipDataset } from "./data/utils";
import { Menu } from 'antd';
import ServantList from './components/ServantList';
import { CloudDownloadOutlined } from "@ant-design/icons";
import ServantCard from './components/ServantCard';

function App() {

  const [state, setState] = useState({
    current: "servant"
  })

  const handleClick = e => {
    // TODO 路由
    console.log('click ', e);
    setState({ current: e.key });
  };

  function handleClickFetch() {
    return parseZipDataset().then(() => {
      message.success('成功获取远程数据');
      console.log("[ServantList] FetchData successfully");
    }).catch((err) => {
      message.error('获取远程数据失败\n 错误信息：' + err)
    })
  }

  return (
    <BrowserRouter>
      <Layout className="App">
        <section className="header">
          <Menu className="nav-menu" onClick={handleClick} selectedKeys={[state.current]} mode="horizontal">
            <Menu.Item key="servant">从者</Menu.Item>
            <Menu.Item key="sucai">素材</Menu.Item>
            <Menu.Item key="static">统计</Menu.Item>
          </Menu>
          <button className="clear-button" onClick={handleClickFetch}><CloudDownloadOutlined /></button>
        </section>
        <Layout>
          <Sider>
            <ServantList></ServantList>
          </Sider>
          <Content>
            <ServantCard></ServantCard>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
