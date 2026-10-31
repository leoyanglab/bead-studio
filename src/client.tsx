import { hydrate } from 'preact';
import { App } from './app';
import { createStore, StoreContext, type Bootstrap } from './model';
import './style.css';
const bootstrap=JSON.parse(document.getElementById('bootstrap')!.textContent!) as Bootstrap;
const store=createStore(bootstrap);
hydrate(<StoreContext.Provider value={store}><App/></StoreContext.Provider>,document.getElementById('app')!);
store.initClient();
