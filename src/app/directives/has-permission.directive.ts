import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Auth } from '../services/auth';

@Directive({
  selector: '[appHasPermission]',
  standalone: false,
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: Auth,
  ) {}

  @Input()
  set appHasPermission(permission: string) {
    this.viewContainer.clear();
    if (this.hasPermission(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }
  }

  private hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
}
