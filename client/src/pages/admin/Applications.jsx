import { useEffect, useState } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function Applications() {

  // ======================================
  // STATE
  // ======================================

  const [applications, setApplications]
    = useState([])

  const [searchTerm, setSearchTerm]
    = useState('')

    const [statusFilter, setStatusFilter]
    = useState('All')

    const [currentPage, setCurrentPage]
    = useState(1)
  
  const applicationsPerPage = 5

  // ======================================
  // FILTER APPLICATIONS
  // ======================================

  const filteredApplications =
  applications.filter((item) => {

    // Search Filter
    const matchesSearch =
      item.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

    // Status Filter
    const matchesStatus =

      statusFilter === 'All'

        ? true

        : item.status === statusFilter

    return (
      matchesSearch &&
      matchesStatus
    )

  })

  // ======================================
// PAGINATION LOGIC
// ======================================

const indexOfLastApplication =
  currentPage * applicationsPerPage

const indexOfFirstApplication =
  indexOfLastApplication -
  applicationsPerPage

const currentApplications =
  filteredApplications.slice(
    indexOfFirstApplication,
    indexOfLastApplication
  )

const totalPages =
  Math.ceil(
    filteredApplications.length /
    applicationsPerPage
  )

  // ======================================
  // FETCH APPLICATIONS
  // ======================================

  useEffect(() => {

    const fetchApplications =
      async () => {

        try {

          const response =
            await axios.get(
              'http://localhost:8000/api/applications'
            )

          setApplications(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchApplications()

  }, [])

  // ======================================
  // UPDATE STATUS
  // ======================================

  const updateStatus =
    async (id, newStatus) => {

      try {

        const response =
          await axios.put(

            `http://localhost:8000/api/applications/${id}`,

            {
              status: newStatus,
            }

          )

        // Update UI
        setApplications(

          applications.map((item) =>

            item._id === id
              ? response.data
              : item

          )

        )

      } catch (error) {

        console.log(error)

        alert('Status Update Failed')

      }

    }

  // ======================================
  // DELETE APPLICATION
  // ======================================

  const deleteApplication =
    async (id) => {

      try {

        await axios.delete(
          `http://localhost:8000/api/applications/${id}`
        )

        // Remove Deleted Data
        setApplications(

          applications.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Application Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

        alert('Delete Failed')

      }

    }

  return (

    <div className="applications-section">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Student Applications
        </h2>

        <p>
          All submitted admission forms will appear here.
        </p>

        {/* Search Input */}
      <div className="mt-3">
      
        <input
          type="text"
          className="form-control"
          placeholder="Search student by name..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />
      
      </div>
      
      {/* Status Filter */}
      <div className="mt-3">
      
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
      
          <option value="All">
            All Status
          </option>
      
          <option value="Pending">
            Pending
          </option>
      
          <option value="Approved">
            Approved
          </option>
      
          <option value="Rejected">
            Rejected
          </option>
      
        </select>
      
      </div>
              

      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="table-responsive">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Name</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Course</th>

              <th>Address</th>

              <th>Message</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {currentApplications.map((item) => (

              <tr key={item._id}>

                <td>{item.name}</td>

                <td>{item.email}</td>

                <td>{item.phone}</td>

                <td>{item.course}</td>

                <td>{item.address}</td>

                <td>{item.message}</td>

                {/* Status */}
                <td>

                  <span
                    className={`status ${item.status.toLowerCase()}`}
                  >

                    {item.status}

                  </span>

                </td>

                {/* Action Buttons */}
                <td>

                  <div className="d-flex gap-2">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        updateStatus(
                          item._id,
                          'Approved'
                        )
                      }
                    >

                      Approve

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        updateStatus(
                          item._id,
                          'Rejected'
                        )
                      }
                    >

                      Reject

                    </button>

                    <button
                      className="table-btn view-btn"
                      onClick={() =>
                        deleteApplication(
                          item._id
                        )
                      }
                    >

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <div className="d-flex justify-content-center mt-4 gap-2">

          {[...Array(totalPages)].map(
            (_, index) => (
        
              <button
                key={index}
                className={`table-btn ${
                  currentPage === index + 1
                    ? 'approve-btn'
                    : 'view-btn'
                }`}
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
        
                {index + 1}
        
              </button>
        
            )
          )}
        
        </div>

      </div>

    </div>

  )

}

export default Applications