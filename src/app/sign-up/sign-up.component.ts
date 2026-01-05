import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup} from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { debounceTime} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private draftKey = 'signUpForm';
  public sharedService = inject(SharedService);

  signupForm!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder) {
    this.buildForm();
    this.restoreDraft();
    this.initAutosave();
  }

  private buildForm() {
    this.signupForm = this.fb.nonNullable.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        policy: [false, [Validators.requiredTrue]],
      }, {
        validators: [SignUpComponent.passwordsMatchValidator],
      });
    }
    
  private restoreDraft(){
    const saved = sessionStorage.getItem(this.draftKey);
    if (!saved) return;
      this.signupForm.patchValue(JSON.parse(saved), { emitEvent: false });
    }
  private initAutosave(){
      this.signupForm.valueChanges
      .pipe(debounceTime(150), takeUntilDestroyed())
      .subscribe(() => this.saveDraft());
  }
  private saveDraft() {
    const { name, email, policy } = this.signupForm.getRawValue();
    sessionStorage.setItem(this.draftKey, JSON.stringify({ name, email, policy }));
  }
  private clearDraft(){
    sessionStorage.removeItem(this.draftKey);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
  if (field === 'password') {
    this.showPassword = !this.showPassword;
  } else {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.signupForm.value as { name: string; email: string; password: string };

    this.authService.signUp(email, password, name)
      .then(() => {
        const contactsRef = collection(this.firestore, 'contacts');
        return addDoc(contactsRef, { name, email, phone: '' });
      })
      .then(() => {
        this.router.navigateByUrl('/login');
      })
      .catch(error => {
        console.error('Fehler beim SignUp:', error);
      });

    this.isSubmitting = true;
    this.signupForm.disable({ emitEvent: false });

    //  Overlay
    this.showSuccessMessage  = true;

    // Nach 1s zur Login-Page
    setTimeout(() => {
      this.goToLogin();
    }, 1500);
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
    this.signupForm.reset();
    this.isSubmitting = false;
    this.showSuccessMessage = false;
    this.clearDraft();
  }
    static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
  }
}
