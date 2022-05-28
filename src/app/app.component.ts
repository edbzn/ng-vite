import { Component } from "@angular/core";
import { Observable, of } from "rxjs";

@Component({
  selector: "app-root",
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [opened]="true"
        mode="side"
      >
        <mat-toolbar>Menu</mat-toolbar>
        <mat-nav-list>
          <a
            mat-list-item
            [routerLink]="['dashboard']"
            routerLinkActive="active"
            >Dashboard</a
          >
          <a mat-list-item [routerLink]="['customer']" routerLinkActive="active"
            >Customer</a
          >
          <a mat-list-item [routerLink]="['admin']" routerLinkActive="active"
            >Admin</a
          >
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>ng-vite</span>
        </mat-toolbar>
        <main><router-outlet></router-outlet></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100%;
      }

      .sidenav {
        width: 200px;
      }

      main {
        padding: 2rem;
      }

      .active {
        font-weight: 600;
      }
    `,
  ],
})
export class AppComponent {
  title = "ng-vite";
}
