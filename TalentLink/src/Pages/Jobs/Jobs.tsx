import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
const Jobs = () => (
  <IonPage>
    <IonHeader className="ion-no-border"><IonToolbar style={{'--background': '#fcf9f2'}}><IonTitle style={{color:'#333', fontWeight:'bold'}}>Vacantes</IonTitle></IonToolbar></IonHeader>
    <IonContent style={{'--background': '#fcf9f2'}} className="ion-padding">Aquí irá la vista de vacantes...</IonContent>
  </IonPage>
);
export default Jobs;