// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportIcons from '../../../app/service/icons';

declare module 'egg' {
  interface IService {
    icons: ExportIcons;
  }
}
