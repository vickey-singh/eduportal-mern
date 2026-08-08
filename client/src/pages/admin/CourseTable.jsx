function CourseTable({

  courseData,

  setFormData,

  setEditId,

  handleDelete,

}) {

    const handleEdit = (course) => {

  setEditId(course._id)

  setFormData({

    courseName: course.courseName,

    courseCode: course.courseCode,

    description: course.description,

    duration: course.duration,

    totalFee: course.totalFee,

    registrationFee: course.registrationFee,

    installmentAllowed:
      course.installmentAllowed,
    
    monthlyInstallment:
      course.monthlyInstallment || '',
    
    threeMonthInstallment:
      course.threeMonthInstallment || '',
    
    sixMonthInstallment:
      course.sixMonthInstallment || '',
    
    fullPaymentFee:
      course.fullPaymentFee || '',
    
    status: course.status,

  })

}

  return (

    <div
      className="table-responsive mt-4"
      style={{
        overflowX: 'auto',
      }}
    >

      <table
        className="table applications-table"
        style={{
          minWidth: '1300px',
        }}
      >

        <thead>

          <tr>

            <th>Course</th>

            <th>Code</th>

            <th>Duration</th>

            <th>Total Fee</th>

            <th>Registration Fee</th>
            
            <th>Monthly</th>
            
            <th>3 Months</th>
            
            <th>6 Months</th>
            
            <th>Full Payment</th>
            
            <th>Installment</th>
            
            <th>Status</th>
            
            <th>Action</th>

          </tr>

        </thead>

        <tbody>
        
          {courseData.length === 0 ? (
        
            <tr>
        
              <td
                colSpan="12"
                className="text-center"
              >
        
                No Courses Found
        
              </td>
        
            </tr>
        
          ) : (
        
            courseData.map((course) => (
        
              <tr key={course._id}>
        
                <td>{course.courseName}</td>
        
                <td>{course.courseCode}</td>
        
                <td>{course.duration}</td>
        
                <td>
                  ₹ {course.totalFee}
                </td>
                
                <td>
                  ₹ {course.registrationFee}
                </td>
                
                <td>
                  ₹ {course.monthlyInstallment || 0}
                </td>
                
                <td>
                  ₹ {course.threeMonthInstallment || 0}
                </td>
                
                <td>
                  ₹ {course.sixMonthInstallment || 0}
                </td>
                
                <td>
                  ₹ {course.fullPaymentFee || 0}
                </td>
                
                <td>
                  {course.installmentAllowed
                    ? 'Yes'
                    : 'No'}
                </td>
        
                <td>
        
                  <span
                    className={
                      course.status === 'Active'
                        ? 'badge bg-success'
                        : 'badge bg-danger'
                    }
                  >
        
                    {course.status}
        
                  </span>
        
                </td>
        
                <td>
        
                  <button
                    className="btn btn-sm btn-primary me-2"
                  
                    onClick={() =>
                      handleEdit(course)
                    }
                  
                  >
                  
                    Edit
                  
                  </button>
        
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDelete(course._id)
                    }
                  >
                    Delete
                  </button>
        
                </td>
        
              </tr>
        
            ))
        
          )}
        
        </tbody>

      </table>

    </div>

  )

}

export default CourseTable