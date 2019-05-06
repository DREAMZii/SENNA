import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SennaAlertService } from 'src/app/core/modules/senna-alert/senna-alert.service';
import { SennaAlertTypesAware } from 'src/app/core/modules/senna-alert/senna-alert.enum';

@Component({
    selector: 'app-senna-alert',
    templateUrl: 'senna-alert.component.html',
    styleUrls: ['senna-alert.component.css']
})
@SennaAlertTypesAware
export class SennaAlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;

    constructor(private alertService: SennaAlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            this.message = message;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
