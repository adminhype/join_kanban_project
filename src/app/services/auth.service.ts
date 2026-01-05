import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInAnonymously, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { FirebaseService } from './firebase.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);

  constructor() { 
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.firebaseService.connectToDatabase();
      } else {
        this.firebaseService.disconnect();
      }
    });
  }

  signUp(email: string, password: string, username: string) {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(response => {
        return updateProfile(response.user, {
          displayName: username
        });
      });
  }

  login(email: string, password: string) {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then((userCredential) => {
      this.firebaseService.connectToDatabase();
      return userCredential;
    });
    return from(promise)
  }

  guestLogin() {
    return signInAnonymously(this.firebaseAuth)
    .then((userCredential) => {
      this.firebaseService.connectToDatabase();
      return userCredential;
    });
  }

  logout() {
    this.firebaseService.disconnect();
    return this.firebaseAuth.signOut().then(() => {
      this.router.navigateByUrl('/');
    });
  }

  loggedInUsername(): string | null {
    return this.firebaseAuth.currentUser?.email || null;
  }
}
