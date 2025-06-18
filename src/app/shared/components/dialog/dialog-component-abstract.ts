import { Observable } from 'rxjs';

export abstract class BaseDialogComponent<TData = any> {
  abstract updateData(data: TData): void | any;
  abstract afterConfirm$(): Observable<boolean>;
  abstract getEmbeddedInstance<T>(): T | null;
}