import { MatPaginatorIntl } from '@angular/material/paginator';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

// This service is necessary to translate the auto-generated texts by MatPaginator
const PAGINATOR_TRANSLATION_LABEL = "credentialManagement.paginator";
const ITEMS_PER_PAGE = PAGINATOR_TRANSLATION_LABEL + '.items-per-page';
const NEXT_PAGE      = PAGINATOR_TRANSLATION_LABEL + '.next-page';
const PREV_PAGE      = PAGINATOR_TRANSLATION_LABEL + '.previous-page';
const FIRST_PAGE     = PAGINATOR_TRANSLATION_LABEL + '.first-page';
const LAST_PAGE      = PAGINATOR_TRANSLATION_LABEL + '.last-page';

@Injectable()
export class MatPaginatorIntlService extends MatPaginatorIntl {
  private readonly translate = inject(TranslateService);
  public constructor() {
    super();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe((e: LangChangeEvent) => {
        this.getAndInitTranslations();
      });

    this.getAndInitTranslations();
  }

  public getAndInitTranslations(): void {
    const KEYS = [ITEMS_PER_PAGE, NEXT_PAGE, PREV_PAGE, FIRST_PAGE, LAST_PAGE];

    this.translate.get(KEYS).pipe(take(1)).subscribe((t: any) => {
      console.log(t)
      this.itemsPerPageLabel = t[ITEMS_PER_PAGE];
      this.nextPageLabel     = t[NEXT_PAGE];
      this.previousPageLabel = t[PREV_PAGE];
      this.firstPageLabel    = t[FIRST_PAGE];
      this.lastPageLabel     = t[LAST_PAGE];

      this.changes.next();
    });

  }

    public override getRangeLabel = (page: number, pageSize: number, length: number): string => {
      const ofTransation = this.translate.instant(PAGINATOR_TRANSLATION_LABEL + ".of");
      if (length === 0 || pageSize === 0) {
        return `0 / ${length}`;
      }
      

      length = Math.max(length, 0);

      const startIndex: number = page * pageSize;
      const endIndex: number = startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

      return `${startIndex + 1} - ${endIndex} ${ofTransation} ${length}`;
    };
}