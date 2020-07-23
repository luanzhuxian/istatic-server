// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportConvert from '../../../app/service/convert';
import ExportIcons from '../../../app/service/icons';
import ExportLink from '../../../app/service/link';
import ExportProject from '../../../app/service/project';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    convert: ExportConvert;
    icons: ExportIcons;
    link: ExportLink;
    project: ExportProject;
    user: ExportUser;
  }
}
