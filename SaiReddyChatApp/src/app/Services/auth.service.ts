
import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged(user => {
      this.userSubject.next(user);
    });
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return null;
    }
  }

  logout() {
    return signOut(this.auth);
  }
}

// import { Injectable } from '@angular/core';
// import { initializeApp } from 'firebase/app';
// //import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, browserLocalPersistence, setPersistence, signInWithPopup } from 'firebase/auth';
// import { Observable, of } from 'rxjs';
// import { Auth, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';

// export class Signup {
//   Id:number | undefined;
//   UserName: string | undefined;
//   EmailAddress: string | undefined;
//   PhoneNumber : number | undefined;
//   Password:string |undefined;
// }



// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//    public auth: any;
//   user: any | null = null;
//   private storageKey = 'users'; // Key to store data in localStorage
//   constructor() {}

//   async loginWithGoogle() {
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(this.auth, provider);
//       return result.user;
//     } catch (error) {
//       console.error('Google Sign-In Error', error);
//       return null;
//     }
//   }

//   logout() {
//     return signOut(this.auth);
//   }

//   // // Use popup-based Google Sign-In
//   // async signInWithGoogle() {
//   //   try {
//   //     const provider = new GoogleAuthProvider();
//   //     const result = await signInWithPopup(this.auth, provider);
//   //     this.user = result.user; // Store the user
//   //     console.log('User signed in:', this.user.displayName);
//   //     return this.user; // Return the user for further processing if needed
//   //   } catch (error) {
//   //     console.error('Error during login:', error);
//   //   }
//   // }

//   // // Logout function
//   // async signOut() {
//   //   try {
//   //     await this.auth.signOut();
//   //     this.user = null;
//   //     console.log('User signed out');
//   //   } catch (error) {
//   //     console.error('Error during logout:', error);
//   //   }
//   // }

//   getUser() {
//     return this.user;
//   }

//   UpdateUserob(user:any){
// this.user = user;
//   }
//   // Create a new user
//   createUser(user: Signup): Observable<Signup> {
//     const users = this.getStoredUsers();
//     user.Id = users.length ? Math.max(...users.map(u => u.Id || 0)) + 1 : 1; // Generate a new ID
//     users.push(user);
//     this.saveUsersToSession(users);
//     return of(user);
//   }

//   // Update an existing user
//   updateUser(id: number, user: Signup): Observable<Signup> {
//     const users = this.getStoredUsers();
//     const index = users.findIndex(u => u.Id === id);
//     if (index !== -1) {
//       users[index] = { ...user, Id: id }; // Ensure ID remains unchanged
//       this.saveUsersToSession(users);
//     }
//     return of(user);
//   }

//   // Get all users
//   getUsers(): Observable<Signup[]> {
//     return of(this.getStoredUsers());
//   }

//   // Helper to retrieve users from localStorage
//   private getStoredUsers(): Signup[] {
//     try {
//       // Try retrieving users from localStorage
//       const users = localStorage.getItem(this.storageKey);
//       if (users) return JSON.parse(users);
  
//       // If localStorage is empty, initialize with default user
//       const defaultUser: Signup = this.getDefaultUser();
//       this.saveUsersToStorage([defaultUser]);
//       return [defaultUser];
//     } catch (error) {
//       console.warn('LocalStorage exceeded limit. Switching to sessionStorage.');
      
//       // Use sessionStorage as a fallback
//       const users = sessionStorage.getItem(this.storageKey);
//       if (users) return JSON.parse(users);
  
//       // If sessionStorage is also empty, initialize with default user
//       const defaultUser: Signup = this.getDefaultUser();
//       this.saveUsersToSession([defaultUser]);
//       return [defaultUser];
//     }
//   }
   
//   // Get the default user object
//   private getDefaultUser(): Signup {
//     return {
//       Id: 1,
//       UserName: 'SaiReddy',
//       EmailAddress: 'sai@gmail.com',
//       PhoneNumber: 9892383834,
//       Password: 'saiA@123',
//     };
//   }
  
//   // Save users to localStorage
//   private saveUsersToStorage(users: Signup[]): void {
//     try {
//       localStorage.setItem(this.storageKey, JSON.stringify(users));
//     } catch (error) {
//       console.error('Failed to save to localStorage:', error);
//     }
//   }
  
//   // Save users to sessionStorage (fallback)
//   private saveUsersToSession(users: Signup[]): void {
//     sessionStorage.setItem(this.storageKey, JSON.stringify(users));
//   }

// }
