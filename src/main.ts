import './styles.css';
import { createApp } from './app/createApp';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('App root element was not found.');
}

createApp(root);
