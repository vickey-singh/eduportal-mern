function CourseForm({
  formData,
  setFormData,
  editId,
  handleSubmit,
}) {

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target


    setFormData({

      ...formData,

      [name]: value,

    })

  }


  return (

    <form onSubmit={handleSubmit}>

      <div className="row">


        {/* ====================================== */}
        {/* COURSE NAME */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Course Name
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter Course Name"
            name="courseName"
            value={
              formData.courseName
            }
            onChange={
              handleChange
            }
            required
          />

        </div>


        {/* ====================================== */}
        {/* COURSE CODE */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Course Code
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter Course Code"
            name="courseCode"
            value={
              formData.courseCode
            }
            onChange={
              handleChange
            }
            required
          />

        </div>


        {/* ====================================== */}
        {/* DURATION */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Duration
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="6 Months / 1 Year"
            name="duration"
            value={
              formData.duration
            }
            onChange={
              handleChange
            }
            required
          />

        </div>


        {/* ====================================== */}
        {/* DESCRIPTION */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Description
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Course Description"
            name="description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
          />

        </div>


        {/* ====================================== */}
        {/* TOTAL FEE */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Total Course Fee
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="30000"
            name="totalFee"
            value={
              formData.totalFee
            }
            onChange={
              handleChange
            }
            min="0"
            required
          />

        </div>


        {/* ====================================== */}
        {/* REGISTRATION FEE */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Registration Fee
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="5000"
            name="registrationFee"
            value={
              formData.registrationFee
            }
            onChange={
              handleChange
            }
            min="0"
            required
          />

        </div>


        {/* ====================================== */}
        {/* MONTHLY INSTALLMENT */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Monthly Installment
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="Example: 1000"
            name="monthlyInstallment"
            value={
              formData.monthlyInstallment
            }
            onChange={
              handleChange
            }
            min="0"
          />

        </div>


        {/* ====================================== */}
        {/* 3 MONTH INSTALLMENT */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            3 Month Installment
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="Example: 2500"
            name="threeMonthInstallment"
            value={
              formData.threeMonthInstallment
            }
            onChange={
              handleChange
            }
            min="0"
          />

        </div>


        {/* ====================================== */}
        {/* 6 MONTH INSTALLMENT */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            6 Month Installment
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="Example: 4500"
            name="sixMonthInstallment"
            value={
              formData.sixMonthInstallment
            }
            onChange={
              handleChange
            }
            min="0"
          />

        </div>


        {/* ====================================== */}
        {/* FULL PAYMENT */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Full Payment Fee
          </label>

          <input
            type="number"
            className="form-control"
            placeholder="Example: 9000"
            name="fullPaymentFee"
            value={
              formData.fullPaymentFee
            }
            onChange={
              handleChange
            }
            min="0"
          />

          <small className="text-muted">

            Discounted amount for one-time
            full course payment.

          </small>

        </div>


        {/* ====================================== */}
        {/* INSTALLMENT ALLOWED */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Installment Allowed
          </label>

          <select
            className="form-control"
            name="installmentAllowed"
            value={
              String(
                formData.installmentAllowed
              )
            }
            onChange={
              handleChange
            }
          >

            <option value="true">
              Yes
            </option>

            <option value="false">
              No
            </option>

          </select>

        </div>


        {/* ====================================== */}
        {/* STATUS */}
        {/* ====================================== */}

        <div className="col-md-6 mb-3">

          <label className="form-label">
            Status
          </label>

          <select
            className="form-control"
            name="status"
            value={
              formData.status
            }
            onChange={
              handleChange
            }
          >

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </div>


      </div>


      {/* ====================================== */}
      {/* SUBMIT */}
      {/* ====================================== */}

      <button
        className="table-btn approve-btn"
        type="submit"
      >

        {
          editId
            ? 'Update Course'
            : 'Add Course'
        }

      </button>

    </form>

  )

}

export default CourseForm