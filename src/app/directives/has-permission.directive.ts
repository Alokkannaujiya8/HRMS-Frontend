import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appHasPermission]',
  standalone: false,
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
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
    const token = localStorage.getItem('token');
    if (!token || !permission) {
      return false;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return false;
    }

    const candidates: unknown[] = [
      payload['permissions'],
      payload['permission'],
      payload['perms'],
      payload['scp'],
      payload['scope'],
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    ];

    const permissionValues = candidates
      .flatMap((item) => this.toStringArray(item))
      .map((item) => item.trim().toLowerCase());

    return permissionValues.includes(permission.trim().toLowerCase());
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private toStringArray(value: unknown): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value === 'string') {
      if (value.includes(' ')) {
        return value.split(' ').filter(Boolean);
      }
      if (value.includes(',')) {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
      return [value];
    }

    return [];
  }
}
