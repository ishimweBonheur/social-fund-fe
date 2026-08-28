import { GoogleLogin } from '@react-oauth/google'

interface GoogleLoginButtonProps {
  disabled?: boolean
  onCredential: (credential: string) => Promise<void>
  onError: (message: string) => void
}

export default function GoogleLoginButton({ disabled, onCredential, onError }: GoogleLoginButtonProps) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Google login is unavailable. Set VITE_GOOGLE_CLIENT_ID.</p>
  }
  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <GoogleLogin
        onSuccess={(response) => response.credential ? void onCredential(response.credential) : onError('Google did not return an ID token.')}
        onError={() => onError('Google sign-in was cancelled or failed.')}
        shape="pill"
        size="large"
        text="continue_with"
        width="320"
      />
    </div>
  )
}
