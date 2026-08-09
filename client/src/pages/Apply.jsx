import {
  createOrder,
  verifyPayment,
  checkStudent,
} from '../services/paymentService'

import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'

import { API_URL } from '../config/api'

import '../assets/styles/apply.css'


function Apply() {

  const navigate = useNavigate()


  // ======================================
  // COURSES
  // ======================================

  const [courses, setCourses] = useState([])

  const [selectedCourse, setSelectedCourse] =
    useState(null)


  // ======================================
  // PAYMENT LOADING
  // ======================================

  const [paymentLoading, setPaymentLoading] =
    useState(false)


  // ======================================
  // FORM DATA
  // ======================================

  const [formData, setFormData] = useState({

    // Student
    name: '',
    dob: '',
    aadharNumber: '',

    // Parents
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    fatherMobile: '',
    motherMobile: '',

    // Contact
    email: '',
    phone: '',

    // Education
    schoolCollegeName: '',

    // Address
    permanentAddress: '',
    currentAddress: '',

    // Course
    course: '',

    // Photo
    image: null,

  })


  // ======================================
  // FETCH COURSES
  // ======================================

  const fetchCourses = async () => {

    try {

      const response =
        await axios.get(
          `${API_URL}/courses`
        )

      setCourses(
        response.data
      )

    } catch (error) {

      console.log(error)

    }

  }


  useEffect(() => {

    fetchCourses()

  }, [])


  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target


    // ==================================
    // COURSE SELECT
    // ==================================

    if (name === 'course') {

      const course =
        courses.find(
          (item) =>
            item.courseName === value
        )

      setSelectedCourse(
        course || null
      )

    }


    setFormData(
      (previousData) => ({

        ...previousData,

        [name]: value,

      })
    )

  }


  // ======================================
  // HANDLE IMAGE
  // ======================================

  const handleImageChange = (e) => {

    const file =
      e.target.files?.[0] || null


    setFormData(
      (previousData) => ({

        ...previousData,

        image: file,

      })
    )

  }


  // ======================================
  // OPEN RAZORPAY
  // ======================================

  const openRazorpay = (order) => {

    if (!window.Razorpay) {

      alert(
        'Razorpay is not loaded. Please refresh the page and try again.'
      )

      setPaymentLoading(false)

      return

    }


    const options = {

      key:
        import.meta.env
          .VITE_RAZORPAY_KEY_ID,

      amount:
        order.amount,

      currency:
        order.currency,

      name:
        'Prerna Institute',

      description:
        'Admission Registration Fee',

      order_id:
        order.id,

      prefill: {

        name:
          formData.name,

        email:
          formData.email,

        contact:
          formData.phone,

      },

      theme: {

        color:
          '#0d6efd',

      },


      // ==================================
      // PAYMENT SUCCESS
      // ==================================

      handler:
        async function (response) {

          try {

            setPaymentLoading(true)


            // ==================================
            // FORM DATA
            // ==================================

            const paymentData =
              new FormData()


            // ==================================
            // RAZORPAY RESPONSE
            // ==================================

            paymentData.append(
              'razorpay_order_id',
              response.razorpay_order_id
            )

            paymentData.append(
              'razorpay_payment_id',
              response.razorpay_payment_id
            )

            paymentData.append(
              'razorpay_signature',
              response.razorpay_signature
            )


            // ==================================
            // STUDENT DETAILS
            // ==================================

            paymentData.append(
              'studentName',
              formData.name
            )

            paymentData.append(
              'dob',
              formData.dob
            )

            paymentData.append(
              'aadharNumber',
              formData.aadharNumber
            )


            // ==================================
            // PARENTS
            // ==================================

            paymentData.append(
              'fatherName',
              formData.fatherName
            )

            paymentData.append(
              'motherName',
              formData.motherName
            )

            paymentData.append(
              'fatherOccupation',
              formData.fatherOccupation
            )

            paymentData.append(
              'motherOccupation',
              formData.motherOccupation
            )

            paymentData.append(
              'fatherMobile',
              formData.fatherMobile
            )

            paymentData.append(
              'motherMobile',
              formData.motherMobile
            )


            // ==================================
            // CONTACT
            // ==================================

            paymentData.append(
              'email',
              formData.email
            )

            paymentData.append(
              'phone',
              formData.phone
            )


            // ==================================
            // EDUCATION
            // ==================================

            paymentData.append(
              'schoolCollegeName',
              formData.schoolCollegeName
            )


            // ==================================
            // ADDRESS
            // ==================================

            paymentData.append(
              'permanentAddress',
              formData.permanentAddress
            )

            paymentData.append(
              'currentAddress',
              formData.currentAddress
            )


            // ==================================
            // COURSE
            // ==================================

            paymentData.append(
              'course',
              formData.course
            )


            // ==================================
            // REGISTRATION PAYMENT
            // ==================================

            paymentData.append(
              'paymentCategory',
              'Registration'
            )

            paymentData.append(
              'paymentType',
              'Full'
            )

            paymentData.append(
              'amountPaid',
              String(
                selectedCourse.registrationFee
              )
            )


            // ==================================
            // IMAGE
            // ==================================

            if (formData.image) {

              paymentData.append(
                'image',
                formData.image
              )

            }


            // ==================================
            // VERIFY PAYMENT
            // ==================================

            const verifyResponse =
              await verifyPayment(
                paymentData
              )


            console.log(
              'Payment verification:',
              verifyResponse
            )


            if (
              !verifyResponse.success
            ) {

              alert(
                verifyResponse.message ||
                'Payment Verification Failed'
              )

              return

            }


            // ==================================
            // SUCCESS MESSAGE
            // ==================================

            alert(
              verifyResponse.message ||
              'Admission Successful'
            )


            // ==================================
            // RECEIPT
            // ==================================

            if (
              verifyResponse.receiptNumber
            ) {

              navigate(
                `/receipt/${verifyResponse.receiptNumber}`
              )

            }

          } catch (error) {

            console.log(error)

            alert(

              error.response?.data?.message ||

              'Payment Verification Failed'

            )

          } finally {

            setPaymentLoading(false)

          }

        },

      modal: {

        ondismiss:
          function () {

            setPaymentLoading(false)

          },

      },

    }


    const razorpay =
      new window.Razorpay(
        options
      )


    razorpay.on(
      'payment.failed',
      function () {

        setPaymentLoading(false)

        alert(
          'Payment Failed. Please try again.'
        )

      }
    )


    razorpay.open()

  }


  // ======================================
  // HANDLE FORM SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      // ==================================
      // COURSE VALIDATION
      // ==================================

      if (!selectedCourse) {

        alert(
          'Please select a course.'
        )

        return

      }


      // ==================================
      // REGISTRATION FEE
      // ==================================

      const registrationFee =
        Number(
          selectedCourse.registrationFee
        )


      if (
        !registrationFee ||
        registrationFee <= 0
      ) {

        alert(
          'Registration fee is not available for this course.'
        )

        return

      }


      // ==================================
      // PREVENT DOUBLE CLICK
      // ==================================

      if (paymentLoading) {

        return

      }


      try {

        setPaymentLoading(true)


        // ==================================
        // CHECK EXISTING STUDENT
        // ==================================

        const check =
          await checkStudent({

            email:
              formData.email,

            phone:
              formData.phone,

          })


        if (check.exists) {

          alert(
            'Student already exists.\n\nPlease use Existing Student Payment.'
          )

          setPaymentLoading(false)

          return

        }


        // ==================================
        // CREATE RAZORPAY ORDER
        // ==================================

        const order =
          await createOrder({

            amount:
              registrationFee,

          })


        if (
          !order?.order
        ) {

          throw new Error(
            'Unable to create payment order.'
          )

        }


        // ==================================
        // OPEN RAZORPAY
        // ==================================

        openRazorpay(
          order.order
        )

      } catch (error) {

        console.log(error)

        setPaymentLoading(false)

        alert(

          error.response?.data?.message ||

          error.message ||

          'Something went wrong'

        )

      }

    }


  return (

    <section className="apply-page">

      <div className="container">


        {/* ====================================== */}
        {/* HEADING */}
        {/* ====================================== */}

        <div className="apply-header text-center">

          <h1>
            Admission Form
          </h1>

          <p>
            Fill out the form below to apply for admission.
          </p>

        </div>


        {/* ====================================== */}
        {/* FORM */}
        {/* ====================================== */}

        <div className="apply-form-wrapper">

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="row">


              {/* ================================== */}
              {/* STUDENT NAME */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Student Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter student name"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* DOB */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Date of Birth
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="dob"
                  value={
                    formData.dob
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* AADHAAR */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Aadhaar Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Aadhaar number"
                  name="aadharNumber"
                  value={
                    formData.aadharNumber
                  }
                  onChange={
                    handleChange
                  }
                  maxLength="12"
                  pattern="[0-9]{12}"
                  required
                />

              </div>


              {/* ================================== */}
              {/* PHONE */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Student Mobile Number
                </label>

                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter mobile number"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* EMAIL */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Gmail / Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* PHOTO */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Student Photo
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />

              </div>


              {/* ================================== */}
              {/* FATHER NAME */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Father's Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter father's name"
                  name="fatherName"
                  value={
                    formData.fatherName
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* MOTHER NAME */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Mother's Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter mother's name"
                  name="motherName"
                  value={
                    formData.motherName
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* FATHER OCCUPATION */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Father's Occupation
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter father's occupation"
                  name="fatherOccupation"
                  value={
                    formData.fatherOccupation
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* MOTHER OCCUPATION */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Mother's Occupation
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter mother's occupation"
                  name="motherOccupation"
                  value={
                    formData.motherOccupation
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* FATHER MOBILE */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Father's Mobile Number
                </label>

                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter father's mobile"
                  name="fatherMobile"
                  value={
                    formData.fatherMobile
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* MOTHER MOBILE */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Mother's Mobile Number
                </label>

                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter mother's mobile"
                  name="motherMobile"
                  value={
                    formData.motherMobile
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* SCHOOL / COLLEGE */}
              {/* ================================== */}

              <div className="col-12 mb-4">

                <label className="form-label">
                  School / College Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter school or college name"
                  name="schoolCollegeName"
                  value={
                    formData.schoolCollegeName
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* ================================== */}
              {/* COURSE */}
              {/* ================================== */}

              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Select Course
                </label>

                <select
                  className="form-select"
                  name="course"
                  value={
                    formData.course
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Choose Course
                  </option>

                  {courses.map(
                    (course) => (

                      <option
                        key={
                          course._id
                        }
                        value={
                          course.courseName
                        }
                      >

                        {
                          course.courseName
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ================================== */}
              {/* PERMANENT ADDRESS */}
              {/* ================================== */}

              <div className="col-12 mb-4">

                <label className="form-label">
                  Permanent Address
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter permanent address"
                  name="permanentAddress"
                  value={
                    formData.permanentAddress
                  }
                  onChange={
                    handleChange
                  }
                  required
                ></textarea>

              </div>


              {/* ================================== */}
              {/* CURRENT ADDRESS */}
              {/* ================================== */}

              <div className="col-12 mb-4">

                <label className="form-label">
                  Current Address
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter current address"
                  name="currentAddress"
                  value={
                    formData.currentAddress
                  }
                  onChange={
                    handleChange
                  }
                  required
                ></textarea>

              </div>


            </div>


            {/* ====================================== */}
            {/* COURSE DETAILS */}
            {/* ====================================== */}

            {selectedCourse && (

              <div className="col-12 mb-4">

                <div className="card border-success shadow-sm">

                  <div className="card-body">

                    <h5 className="mb-3">
                      Course Details
                    </h5>

                    <div className="row">


                      <div className="col-md-6">

                        <p>

                          <strong>
                            Duration:
                          </strong>{' '}

                          {
                            selectedCourse.duration
                          }

                        </p>

                      </div>


                      <div className="col-md-6">

                        <p>

                          <strong>
                            Total Course Fee:
                          </strong>{' '}

                          ₹{
                            selectedCourse.totalFee
                          }

                        </p>

                      </div>


                      <div className="col-md-6">

                        <p>

                          <strong>
                            Registration Fee:
                          </strong>{' '}

                          ₹{
                            selectedCourse.registrationFee
                          }

                        </p>

                      </div>


                      <div className="col-md-6">

                        <p>

                          <strong>
                            Course Fee After Admission:
                          </strong>{' '}

                          ₹{
                            selectedCourse.totalFee
                          }

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )}


            {/* ====================================== */}
            {/* PAYMENT SUMMARY */}
            {/* ====================================== */}

            {selectedCourse && (

              <div className="col-12 mb-4">

                <div className="alert alert-primary">

                  <h5>
                    Admission Payment
                  </h5>

                  <hr />

                  <p>

                    <strong>
                      Registration Fee Payable:
                    </strong>{' '}

                    ₹{
                      selectedCourse.registrationFee
                    }

                  </p>


                  <p className="mb-0">

                    <strong>
                      Course Fee:
                    </strong>{' '}

                    ₹{
                      selectedCourse.totalFee
                    }

                    <br />

                    <small className="text-muted">

                      Course fee will be paid separately
                      after admission.

                    </small>

                  </p>

                </div>

              </div>

            )}


            {/* ====================================== */}
            {/* SUBMIT */}
            {/* ====================================== */}

            <button
              type="submit"
              className="apply-btn"
              disabled={
                !selectedCourse ||
                paymentLoading
              }
            >

              {paymentLoading
                ? 'Processing...'
                : 'Pay Registration Fee'}

            </button>


          </form>

        </div>

      </div>

    </section>

  )

}

export default Apply