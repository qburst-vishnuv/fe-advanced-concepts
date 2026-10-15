
// context to hold state

import {  createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

export function Tabs({children, defaultTab}) {

  const [activeTab, setActiveTab] = useState(defaultTab);

  return <TabsContext.Provider value={{activeTab, setActiveTab}}>
    <div>
    {children}
  </div>
  </TabsContext.Provider>
}

Tabs.List = function TabList({children}){
  return <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #eee' }}>{children}</div>;
}

Tabs.Tab = function Tab({id,children}) {

console.log(id)
  const {
    activeTab, 
    setActiveTab
  } = useContext(TabsContext);

  const isActiveTab = id === activeTab



  return <button
    onClick={() => setActiveTab(id)}
    style={{
      background:"#fff",
      border:"1px solid #ddd",
      cursor:"pointer",
      padding:"8px 20px",
      marginBottom:"5px",
      ...(isActiveTab ? {color:"#636fa3"} : {color:"#302c2c"})
    }}
  >
    {children}
  </button>
}

Tabs.Panel = function TabPanel({id,children}) {

  const { activeTab} = useContext(TabsContext);
  
  return activeTab === id ? children : null;

}



export function TabsDemo() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Compound Components Pattern (Tabs)</h2>
      
      <Tabs defaultTab="account">
        <Tabs.List>
          <Tabs.Tab id="account">Account Settings</Tabs.Tab>
          <Tabs.Tab id="security">Security & Password</Tabs.Tab>
          <Tabs.Tab id="billing">Billing & Plans</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel id="account">
          <p>User profile form and email preferences go here.</p>
        </Tabs.Panel>

        <Tabs.Panel id="security">
          <p>Two-factor authentication and password update form.</p>
        </Tabs.Panel>

        <Tabs.Panel id="billing">
          <p>Payment methods and subscription history.</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}