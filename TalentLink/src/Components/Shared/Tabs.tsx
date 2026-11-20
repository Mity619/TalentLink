import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { home, homeOutline, briefcase, briefcaseOutline, chatbubbles, chatbubblesOutline, person, personOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Index from '../../Pages/Index/Index';
import Profile from '../../Pages/Profile/Profile';
import Jobs from '../../Pages/Jobs/Jobs'; 
import Chats from '../../Pages/Chats/Chats';
import './Tabs.css'

const Tabs = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/index" component={Index} />
        <Route exact path="/app/jobs" component={Jobs} /> 
        <Route exact path="/app/chats" component={Chats} />
        <Route exact path="/app/profile" component={Profile} />
        <Route exact path="/app">
          <Redirect to="/app/index" />
        </Route>
      </IonRouterOutlet>
      
      <IonTabBar slot="bottom" className="custom-tab-bar">
        <IonTabButton tab="index" href="/app/index">
          <IonIcon icon={homeOutline} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>
        <IonTabButton tab="jobs" href="/app/jobs">
          <IonIcon icon={briefcaseOutline} />
          <IonLabel>Vacantes</IonLabel>
        </IonTabButton>
        <IonTabButton tab="chats" href="/app/chats">
          <IonIcon icon={chatbubblesOutline} />
          <IonLabel>Chats</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/app/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;