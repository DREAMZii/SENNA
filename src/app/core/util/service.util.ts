import {AzureService, NewsService, ReferenceService} from '@app/services';
import {SennaAlertService} from "@app/core/modules/senna-alert/senna-alert.service";

export class ServiceUtil {
  public static referenceService: ReferenceService;
  public static azureService: AzureService;
  public static newsService: NewsService;
  public static alertService: SennaAlertService;
}
