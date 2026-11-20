import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
const Chats = () => (
  <IonPage>
    <IonHeader className="ion-no-border"><IonToolbar style={{'--background': '#fcf9f2'}}><IonTitle style={{color:'#333', fontWeight:'bold'}}>Mis Chats</IonTitle></IonToolbar></IonHeader>
    <IonContent style={{'--background': '#fcf9f2'}} className="ion-padding">Aquí irá la vista de chats...</IonContent>
  </IonPage>
);
export default Chats;