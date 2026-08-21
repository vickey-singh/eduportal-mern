function CourseTable({
  courseData,
  setFormData,
  setEditId,
  handleDelete,
}) {

  // ======================================
  // EDIT COURSE
  // ======================================

  const handleEdit = (course) => {

    setEditId(
      course._id
    )


    setFormData({

      courseName:
        course.courseName || '',

      courseCode:
        course.courseCode || '',

      description:
        course.description || '',

      duration:
        course.duration || '',

      batchTime:
        course.batchTime || '',


      // ==================================
      // FEES
      // ==================================

      totalFee:
        course.totalFee ?? '',

      registrationFee:
        course.registrationFee ?? '',


      // ==================================
      // PAYMENT PLANS
      // ==================================

      fullPaymentFee:
        course.fullPaymentFee ?? '',


      // ==================================
      // INSTALLMENT
      // ==================================

      installmentAllowed:
        course.installmentAllowed ?? true,


      // ==================================
      // STATUS
      // ==================================

      status:
        course.status || 'Active',

    })


    // ======================================
    // SCROLL TO FORM
    // ======================================

    window.scrollTo({

      top: 0,

      behavior: 'smooth',

    })

  }


  return (

    <div
      className="table-responsive mt-4"
      style={{
        overflowX: 'auto',
        width: '100%',
      }}
    >

      <table
        className="table applications-table"
        style={{
          minWidth: '1400px',
        }}
      >

        <thead>

          <tr>

            <th>
              Course
            </th>

            <th>
              Code
            </th>

            <th>
              Duration
            </th>

            <th>
              Batch Time
            </th>

            <th>
              Total Fee
            </th>

            <th>
              Registration Fee
            </th>

            <th>
              Full Payment
            </th>

            <th>
              Installment
            </th>

            <th>
              Status
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>


        <tbody>

          {courseData.length === 0 ? (

            <tr>

              <td
                colSpan="10"
                className="text-center"
              >

                No Courses Found

              </td>

            </tr>

          ) : (

            courseData.map(
              (course) => (

                <tr
                  key={
                    course._id
                  }
                >


                  {/* ==================================
                      COURSE
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {
                      course.courseName
                    }

                  </td>


                  {/* ==================================
                      CODE
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {
                      course.courseCode
                    }

                  </td>


                  {/* ==================================
                      DURATION
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {
                      course.duration
                    }

                  </td>


                  {/* ==================================
                      BATCH TIME
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {
                      course.batchTime
                        ? course.batchTime
                        : 'Not Set'
                    }

                  </td>


                  {/* ==================================
                      TOTAL FEE
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    ₹ {
                      course.totalFee
                    }

                  </td>


                  {/* ==================================
                      REGISTRATION FEE
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    ₹ {
                      course.registrationFee
                    }

                  </td>


                  {/* ==================================
                      FULL PAYMENT
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    ₹ {
                      course.fullPaymentFee ||
                      0
                    }

                  </td>


                  {/* ==================================
                      INSTALLMENT
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {
                      course.installmentAllowed
                        ? 'Yes'
                        : 'No'
                    }

                  </td>


                  {/* ==================================
                      STATUS
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    <span
                      className={

                        course.status ===
                        'Active'

                          ? 'badge bg-success'

                          : 'badge bg-danger'

                      }
                    >

                      {
                        course.status
                      }

                    </span>

                  </td>


                  {/* ==================================
                      ACTION
                  ================================== */}

                  <td
                    style={{
                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    <button
                      type="button"
                      className="
                        btn
                        btn-sm
                        btn-primary
                        me-2
                      "
                      onClick={() =>
                        handleEdit(
                          course
                        )
                      }
                    >

                      Edit

                    </button>


                    <button
                      type="button"
                      className="
                        btn
                        btn-sm
                        btn-danger
                      "
                      onClick={() =>
                        handleDelete(
                          course._id
                        )
                      }
                    >

                      Delete

                    </button>

                  </td>


                </tr>

              )
            )

          )}

        </tbody>

      </table>

    </div>

  )

}

export default CourseTable