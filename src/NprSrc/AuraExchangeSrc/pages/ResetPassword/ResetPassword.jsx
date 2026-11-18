
import { useEffect, useState } from "react"
import { X, Eye, EyeOff, Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
  selectSiteHeaderColor,
  selectSiteLoginColor,
  selectSiteSignUpColor,
  selectSiteLogo,
  selectDomainID,
  selectSiteName,
  selectSiteFevicon,
  selectSite, // Declare the selectSite variable
} from "../../../../utils/helper/commonSelectors"
import { resetPassword, forgotPassword } from "../../../../api"
import Loader from "../../../../utils/Loader"
import { generatePresignedUrl } from "../../../../utils/helper/generatePresignedUrl"
import { usePrimaryColor } from "../../hooks/useThemeColors"

export default function ResetPassword() {
  const dispatch = useDispatch()
  const siteDetails = useSelector(selectSite())
  const navigator = useNavigate()
  const [mobile, setMobile] = useState("")
  const navigate = useNavigate()
  const domainId = useSelector(selectDomainID())
  const [domain] = useState(siteDetails?.domainName?._id)

  const headerColor = useSelector(selectSiteHeaderColor())
  const loginBtnColor = useSelector(selectSiteLoginColor())
  const signUpBtnColor = useSelector(selectSiteSignUpColor())
  const siteName = useSelector(selectSiteName())
  const siteLogo = useSelector(selectSiteLogo())
  const siteFavIcon = useSelector(selectSiteFevicon())
  const [logoUrl, setLogoUrl] = useState(null)
  const [favIconUrl, setFavIconUrl] = useState(null)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const previousRoute = useSelector((state) => state.route.previousRoute)
  const PrimaryColor = usePrimaryColor()

  const handleMobileSubmit = async (e) => {
    e?.preventDefault()
    setError("")

    if (!mobile.trim()) {
      setError("Mobile number is required")
      return
    }

    const mobileRegex = /^[0-9]{10}$/
    if (!mobileRegex.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setLoading(true)
    try {
      const response = await forgotPassword({ mobile, domain })
      if (response.success) {
        setStep(2)
        toast.success("OTP has been sent to your mobile")
      } else {
        setError(response.data.message || "Failed to send OTP")
        toast.error(response.data.message || "Failed to send OTP")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError("Something went wrong. Please try again.")
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e?.preventDefault()
    setError("")

    if (!otp.trim()) {
      setError("OTP is required")
      return
    }
    if (!newPassword) {
      setError("New password is required")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const response = await resetPassword({
        mobile,
        otp,
        newPassword,
        domain,
      })
      if (response.success) {
        toast.success("Password reset successfully")
        navigator("/")
      } else {
        setError(response.data.message || "Failed to reset password")
        toast.error(response.data.message || "Failed to reset password")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setError("Something went wrong. Please try again.")
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e?.target
    if (name === "mobile") {
      setMobile(value.replace(/\D/g, "").slice(0, 10))
    } else if (name === "otp") {
      setOtp(value.replace(/\D/g, "").slice(0, 6))
    } else if (name === "newPassword") {
      setNewPassword(value)
    } else if (name === "confirmPassword") {
      setConfirmPassword(value)
    }
    setError("")
  }

  useEffect(() => {
    if (!siteLogo && !siteFavIcon && !siteName) return

    const fetchAssets = async () => {
      try {
        const [logoPresigned, favIconPresigned] = await Promise.all([
          siteLogo ? generatePresignedUrl(siteLogo) : Promise.resolve(null),
          siteFavIcon ? generatePresignedUrl(siteFavIcon) : Promise.resolve(null),
        ])

        if (logoPresigned) setLogoUrl(logoPresigned)
        if (favIconPresigned) setFavIconUrl(favIconPresigned)
        if (siteName) document.title = siteName
      } catch (error) {
        console.error("Error fetching site assets:", error)
        toast.error("Failed to load site assets. Please try again.")
      }
    }

    fetchAssets()
  }, [siteLogo, siteFavIcon, siteName])

  return (
    <div
      className="h-screen overflow-hidden  flex flex-col items-center justify-center p-4 px-10 sm:px-0 relative"
      style={{
        backgroundImage: `linear-gradient(180deg, ${headerColor?.start || "#000"}, ${headerColor?.end || "#000"})`,
      }}
    >
      <button
        className="absolute top-6 right-6 text-black p-1 text-bold rounded-md hover:text-gray-700 transition-colors"
        onClick={() => navigate("/")}
        style={{
          backgroundImage: `linear-gradient(180deg, ${headerColor?.start || "#000"}, ${headerColor?.end || "#000"})`,
        }}
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-center">
          {logoUrl && <img src={logoUrl || "/placeholder.svg"} alt={siteName} className="h-14" />}
        </div>

        {step === 1 && (
          <form onSubmit={handleMobileSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-white text-xl font-bold">Reset Password</h2>
              <p className="text-white/80 text-sm mt-2">Enter your mobile number to receive OTP</p>
            </div>

            <div className="relative">
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Phone size={20} className="text-gray-600" />
              </div>
            </div>

            {error && <p className="text-red-300 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 text-white font-bold rounded-lg transition-colors duration-200 flex justify-center items-center space-x-3"
              disabled={loading}
              style={{
                background: `linear-gradient(180deg, ${
                  loginBtnColor?.start || "#045662"
                }, ${loginBtnColor?.end || "#045662"})`,
              }}
            >
              {loading ? (
                <>
                  <Loader />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send OTP</span>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-white text-xl font-bold">Enter OTP & New Password</h2>
              <p className="text-white/80 text-sm mt-2">OTP sent to {mobile}</p>
            </div>

            <div className="relative">
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPassword ? <EyeOff size={20} fill="black" /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 bg-white rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} fill="black" /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p className="text-red-300 text-sm text-center">{error}</p>}

            <div className="space-y-2">
              <button
                type="submit"
                className="w-full py-3 text-white font-bold rounded-lg transition-colors duration-200 flex justify-center items-center space-x-3"
                disabled={loading}
                style={{
                  background: `linear-gradient(180deg, ${
                    loginBtnColor?.start || "#045662"
                  }, ${loginBtnColor?.end || "#045662"})`,
                }}
              >
                {loading ? (
                  <>
                    <Loader />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors duration-200"
                style={{
                  background: `linear-gradient(180deg, ${
                    signUpBtnColor?.start || "#045662"
                  }, ${signUpBtnColor?.end || "#045662"})`,
                }}
              >
                Back to Mobile Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
