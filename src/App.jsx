import { useState } from 'react'
import Layout, { Content, Footer} from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import 'antd/dist/antd.css'
import './App.css';
import { Menu } from 'antd';
import ServantList from './ components/ServantList';

function App() {

  const [state, setState] = useState({
    current: "servant"
  })
  

  const handleClick = e => {
    console.log('click ', e);
    setState({ current: e.key });
  };

  return (
    <Layout className="App">
        <Menu onClick={handleClick} selectedKeys={[state.current]} mode="horizontal">
          <Menu.Item key="servant">从者</Menu.Item>
          <Menu.Item key="sucai">素材</Menu.Item>
          <Menu.Item key="static">统计</Menu.Item>
        </Menu>
      <Layout>
        <Sider>
          <ServantList></ServantList>
        </Sider>
        <Content>Content</Content>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default App;
