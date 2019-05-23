import { Component, OnInit } from '@angular/core';

import { SennaAlertService } from 'src/app/core/modules/senna-alert/senna-alert.service';
import { SennaAlertTypesAware } from 'src/app/core/modules/senna-alert/senna-alert.enum';

@Component({
    selector: 'app-senna-alert',
    templateUrl: 'senna-alert.component.html',
    styleUrls: ['senna-alert.component.css']
})
@SennaAlertTypesAware
export class SennaAlertComponent implements OnInit {

    constructor(private alertService: SennaAlertService) { }

    ngOnInit() {

    }
}
