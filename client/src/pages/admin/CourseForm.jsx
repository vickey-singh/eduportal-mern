function CourseForm({
  formData,
  setFormData,
  editId,
  handleSubmit,
}) {

    const handleChange = (e) => {

  const { name, value } = e.target

  setFormData({

    ...formData,

    [name]: value,

  })

}


  return (
    <div className="admin-form-wrapper">

      <form onSubmit={handleSubmit}>

        <div className="row">

          {/* Course Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Course Name
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter Course Name"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
            />
          </div>

          {/* Course Code */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Course Code
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter Course Code"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
            />
          </div>

          {/* Duration */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Duration
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="6 Months / 1 Year"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Description
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Course Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Total Fee */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Total Fee
            </label>

            <input
              type="number"
              className="form-control"
              placeholder="30000"
              name="totalFee"
              value={formData.totalFee}
              onChange={handleChange}
            />
          </div>

          {/* Registration Fee */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Registration Fee
            </label>

            <input
              type="number"
              className="form-control"
              placeholder="5000"
              name="registrationFee"
              value={formData.registrationFee}
              onChange={handleChange}
            />
          </div>

          {/* Monthly Installment */}
          <div className="col-md-6 mb-3">
          
            <label className="form-label">
              Monthly Installment
            </label>
          
            <input
              type="number"
              className="form-control"
              placeholder="5000"
              name="monthlyInstallment"
              value={formData.monthlyInstallment}
              onChange={handleChange}
            />
          
          </div>
          
          
          {/* 3 Month Installment */}
          <div className="col-md-6 mb-3">
          
            <label className="form-label">
              3 Month Installment
            </label>
          
            <input
              type="number"
              className="form-control"
              placeholder="12000"
              name="threeMonthInstallment"
              value={formData.threeMonthInstallment}
              onChange={handleChange}
            />
          
          </div>
          
          
          {/* 6 Month Installment */}
          <div className="col-md-6 mb-3">
          
            <label className="form-label">
              6 Month Installment
            </label>
          
            <input
              type="number"
              className="form-control"
              placeholder="20000"
              name="sixMonthInstallment"
              value={formData.sixMonthInstallment}
              onChange={handleChange}
            />
          
          </div>
          
          
          {/* Full Payment Fee */}
          <div className="col-md-6 mb-3">
          
            <label className="form-label">
              Full Payment Fee
            </label>
          
            <input
              type="number"
              className="form-control"
              placeholder="28000"
              name="fullPaymentFee"
              value={formData.fullPaymentFee}
              onChange={handleChange}
            />
          
          </div>

        {/* Installment */}
          <div className="col-md-3 mb-3">
          
            <label className="form-label">
              Installment Allowed
            </label>
          
            <select
              className="form-control"
              name="installmentAllowed"
              value={formData.installmentAllowed}
              onChange={handleChange}
            >
          
              <option value="true">Yes</option>
              <option value="false">No</option>
          
            </select>
          
          </div>

        {/* Status */}
        <div className="col-md-3 mb-3">
        
          <label className="form-label">
            Status
          </label>
        
          <select
            className="form-control"
            name="status"
            value={formData.status}
            onChange={handleChange}
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

        <button
          className="table-btn approve-btn"
          type="submit"
        >
          {editId ? 'Update Course' : 'Add Course'}
        </button>

      </form>

    </div>
  )
}

export default CourseForm