// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportFile from '../../../app/controller/file';
import ExportIcons from '../../../app/controller/icons';
import ExportLink from '../../../app/controller/link';
import ExportProject from '../../../app/controller/project';

declare module 'egg' {
  interface IController {
    file: ExportFile;
    icons: ExportIcons;
    link: ExportLink;
    project: ExportProject;
  }
}
