import 'antd/dist/antd.css';
import './App.css';

import { BulbOutlined, CalculatorOutlined, ClearOutlined, CloudDownloadOutlined, ExclamationCircleOutlined, ExportOutlined, ImportOutlined, InfoCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { ConfigProvider, Menu, message, Popover, Modal } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Redirect, Route, Switch, withRouter } from 'react-router-dom';

import cookies from './lib/cookies';
import ItemCategory from './pages/ItemCategory';
import ItemContents from './pages/ItemContents';
import ServantCard from './pages/ServantCard';
import ServantList from './pages/ServantList';
import Statistic from './pages/Statistic';
import { parseZipDataset } from './utils/dataset-resolve';
import { deletedb, getAllSettings, putAllSettings, reconstructCalctable } from './utils/db';
import { TableUserSettingRow, UserSettingType } from './utils/db-type';
import AppInfoModal from './components/AppInfoModal';
import bgimg from './assets/imgs/merlin-line.png'

const { confirm } = Modal;

export const Pages = {
  // For router
  servantList: "servants" as const,
  itemList: "items" as const,
  statistic: "statistic" as const,
  itemCategory: {
    materials: 'materials' as const,
    stones: 'stones' as const,
    chess: 'chess' as const
  },
  // Not for router
  servantContent: "content",
  itemContent: "item-content",
}

let navCurrent: string = Pages.servantList // header selection controller
let pageCurrent: string = Pages.servantList // class controller

function App(props: any) {
  const servantSiderEl = useRef<HTMLDivElement>(null);

  const [state, setState] = useState({
    navCurrent,
    pageCurrent,
    isDark: cookies.getCookie('isdark') === "true" ? true : false,
  })
  const [infoModal, setInfoModel] = useState(false)
  const [showmenu, setshowmenu] = useState(false)

  // pageOnChange
  useEffect(() => {
    const paths = window.location.pathname.split('/') // Format: ["", "servants", "100100"]
    if (paths.length === 2) {
      setState(s => { return { ...s, navCurrent: paths[1], pageCurrent: paths[1] } })
    }
    if (paths.length === 3) {
      setState(s => { return { ...s, navCurrent: paths[1], pageCurrent: paths[1] } })
      switch (paths[1]) {
        case Pages.servantList:
          setState(s => { return { ...s, navCurrent: paths[1], pageCurrent: Pages.servantContent } })
          break;
        case Pages.itemList:
          setState(s => { return { ...s, navCurrent: paths[1], pageCurrent: Pages.itemContent } })
          break;
        default:
          break;
      }
    }
  }, [props.location.pathname])

  async function handleClickFetch() {
    return parseZipDataset().then(() => {
      message.success({
        content: '更新数据成功',
        className: state.isDark ? 'message-restyle-dark' : '',
      });
      console.log("[App.tsx] DONE database updated");
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }).catch((err) => {
      message.error({
        content: '获取远程数据失败, 错误信息：' + err,
        className: state.isDark ? 'message-restyle-dark' : '',
      })
    })
  }


  function switchTheme() {
    cookies.setCookie("isdark", (!state.isDark).toString())
    setState({ ...state, isDark: !state.isDark })
  }

  /**
   * For Mobile view experience, do not re-render the page when click top route
   * 
   * @param topNavTarget DO NOT start with "/"
   * @returns 
   */
  function handleSubNav(topNavTarget: string) {
    if (window.location.pathname.split("/")[1] === topNavTarget) {
      return `${window.location.pathname}`
    }
    return `/${topNavTarget}`
  }

  /**
   * For Mobile View issue. remove top nav "current-page class"
   */
  function addCurrentOnSidebar() {
    // add class
    if (servantSiderEl.current != null) {
      servantSiderEl.current.classList.add('current-page')
    }
  }

  function removeCurrentOnSidebar() {
    if (servantSiderEl.current != null) {
      servantSiderEl.current.classList.remove('current-page')
    }
  }

  const moreOptionRender = () => {
    return (
      <div className="popover-menu-opts popover-opts">
        <li onClick={() => { importSetting(); setshowmenu(false) }}><ImportOutlined />导入规划</li>
        <li onClick={() => { exportSetting(); setshowmenu(false) }}><ExportOutlined />导出规划</li>
        <li onClick={() => { handleClickFetch(); setshowmenu(false) }}><CloudDownloadOutlined />更新数据包</li>
        <li onClick={() => { reCalc(); setshowmenu(false) }}><CalculatorOutlined />重新统计</li>
        <li onClick={() => { resetAll(); setshowmenu(false) }}><ClearOutlined />重置App</li>
        <li onClick={() => { setInfoModel(true); setshowmenu(false) }}><InfoCircleOutlined />App信息</li>
      </div>
    )
  }

  function reCalc() {
    reconstructCalctable().then(() => {
      message.success({ content: '统计成功', className: state.isDark ? 'message-restyle-dark' : '' })
      if (window.location.pathname.includes(Pages.statistic)) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }).catch(e => {
      console.error(e)
      message.error({ content: '统计失败，错误信息:' + e, className: state.isDark ? 'message-restyle-dark' : '' })
    })
  }

  function exportSetting() {
    getAllSettings().then(results => {
      const blob = new Blob([JSON.stringify(results)], { type: 'application/json' })

      const eleLink = document.createElement('a');
      eleLink.download = 'fgomerlin-userdata.json';
      eleLink.style.display = 'none';
      eleLink.href = URL.createObjectURL(blob);
      document.body.appendChild(eleLink);
      eleLink.click(); // trigger download
      document.body.removeChild(eleLink);
    })
  }

  function importSetting() {
    // <input type="file" id="btn_file" accept='application/json' style={{display:'none'}}></input>
    const eleLink = document.createElement("input")
    eleLink.type = 'file'
    eleLink.style.display = 'none'
    eleLink.accept = 'application/json'
    document.body.appendChild(eleLink);
    eleLink.click();
    eleLink.onchange = (e) => {
      if (eleLink.value === "" || eleLink.files === null || eleLink.files.length === 0) {
        alert("文件为空")
      } else {
        const blob = eleLink.files[0]
        console.debug(blob.name, blob.size);
        blob.text().then(text => {
          const obj = (JSON.parse(text)) as TableUserSettingRow[]
          if (!(obj instanceof Array)) {
            throw new Error('数据格式有误')
          } else if (obj.length !== 0 && (
            obj[0].id === undefined ||
            obj[0].name === undefined ||
            obj[0].type !== (UserSettingType.Item || UserSettingType.Servant) ||
            obj[0].setting === undefined
            // TODO obj[0].setting 之后找个库进行 run time 类型验证
          )) {
            throw new Error('数据格式有误')
          }
          putAllSettings(obj, 'overlay').then(() => {
            return reconstructCalctable()
          }).then(() => {
            message.success({
              content: '导入成功',
              className: state.isDark ? 'message-restyle-dark' : '',
            });
            setTimeout(() => {
              window.location.reload()
            }, 500)
          })
        }).catch(e => {
          console.error(e)
          message.error({
            content: '导入错误：' + e,
            className: state.isDark ? 'message-restyle-dark' : '',
          });
        })
      }
    }
    document.body.removeChild(eleLink);
  }

  function resetAll() {
    confirm({
      title: '确认清空所有数据？',
      icon: <ExclamationCircleOutlined style={{ color: '#ff5757 !important' }} />,
      content: '这将导致您的所有规划数据丢失，建议导出规划数据以备份',
      okText: '已知风险，确认清空',
      cancelText: '取消',
      className: state.isDark ? 'modal-dark' : 'modal-light',
      onOk() {
        deletedb().then(() => {
          message.success({
            content: 'App已清空',
            className: state.isDark ? 'message-restyle-dark' : '',
          });
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }).catch((e) => {
          console.error(e)
          message.error({
            content: 'App清空失败：' + e,
            className: state.isDark ? 'message-restyle-dark' : '',
          });
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  return (
    <ConfigProvider getPopupContainer={() => document.getElementById('popover-anchor')!}>
      <div className={state.isDark ? "app dark" : "app light"}>
        <Menu className="app-menu" selectedKeys={[state.navCurrent]} mode="horizontal">
          <Menu.Item className="menu-item" key={Pages.servantList}>
            <Link to={handleSubNav(Pages.servantList)} onClick={addCurrentOnSidebar}>从者</Link>
          </Menu.Item>
          <Menu.Item className="menu-item" key={Pages.itemList}>
            <Link to={`/${Pages.itemList}/materials`}>素材</Link>
          </Menu.Item>
          <Menu.Item className="menu-item" key={Pages.statistic}>
            <Link to={`/${Pages.statistic}`}>统计</Link>
          </Menu.Item>
          <Menu.Item style={{ marginLeft: "auto" }} key="theme" className="menu-button">
            <button className="clear-button" onClick={switchTheme}><BulbOutlined /></button>
          </Menu.Item>
          <Menu.Item style={{ marginRight: "10px" }} key="more" className="menu-button">
            <Popover placement="bottom" content={moreOptionRender} trigger="click" visible={showmenu}>
              <button className="clear-button" onClick={() => setshowmenu(!showmenu)}><MenuOutlined /></button>
            </Popover>
          </Menu.Item>
        </Menu>
        <div className="app-content">
          <Switch>
            <Route path={`/${Pages.servantList}`}>
              <aside ref={servantSiderEl} className={state.pageCurrent === Pages.servantList ? "sider current-page" : "sider"}>
                <ServantList rmCurrentOnSidebar={removeCurrentOnSidebar} />
              </aside>
              <Content className={state.pageCurrent === Pages.servantContent ? "content current-page" : "content"}>
                <Route path={`/${Pages.servantList}/:id`} component={ServantCard} />
                {window.location.pathname === `/${Pages.servantList}` ? <img src={bgimg} alt='' className='bgimg' /> : ''}
              </Content>
            </Route>
            <Route path={`/${Pages.itemList}`}>
              <aside ref={servantSiderEl} className={state.pageCurrent === Pages.itemList ? "item-sider current-page" : "item-sider"}>
                <ItemCategory />
              </aside>
              <Content className={state.pageCurrent === Pages.itemContent ? "content current-page" : "content"}>
                <Route path={`/${Pages.itemList}/:category`} component={ItemContents} />
              </Content>
            </Route>
            <Route path={`/${Pages.statistic}`}>
              <Statistic />
            </Route>
            <Redirect to={`/${Pages.servantList}`} />
          </Switch>
        </div>
        <div id="popover-anchor"></div>
        {infoModal ? <AppInfoModal close={() => setInfoModel(false)} /> : ''}
      </div>
    </ConfigProvider>
  );
}

export default withRouter(App);
