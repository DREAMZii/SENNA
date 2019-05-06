import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SennaAlertService} from 'src/app/core/modules/senna-alert/senna-alert.service';
import {SennaAlertComponent} from 'src/app/core/modules/senna-alert/senna-alert.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    SennaAlertComponent
  ],
  providers: [SennaAlertService],
  exports: [SennaAlertComponent]
})
export class SennaAlertModule {}
