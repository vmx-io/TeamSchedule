import { Routes } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { CalendarComponent } from './calendar/calendar.component';

export const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'calendar/:sheetName', component: CalendarComponent },
  { path: '**', redirectTo: '' }
];
