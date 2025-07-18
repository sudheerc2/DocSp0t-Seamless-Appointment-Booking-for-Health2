import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { message } from 'antd';

const UserAppointments = () => {
  const [type, setType] = useState(false); // true = doctor, false = user
  const [userAppointments, setUserAppointments] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const getUserAppointment = async (userId) => {
    try {
      const res = await axios.get('http://localhost:8001/api/user/getuserappointments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: { userId },
      });
      if (res.data.success) {
        message.success(res.data.message);
        setUserAppointments(res.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error('Something went wrong while fetching user appointments');
    }
  };

  const getDoctorAppointment = async (userId) => {
    try {
      const res = await axios.get('http://localhost:8001/api/doctor/getdoctorappointments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: { userId },
      });
      if (res.data.success) {
        message.success(res.data.message);
        setDoctorAppointments(res.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error('Something went wrong while fetching doctor appointments');
    }
  };

  const handleStatus = async (userId, appointmentId, status) => {
    try {
      const res = await axios.post(
        'http://localhost:8001/api/doctor/handlestatus',
        {
          userid: userId,
          appointmentId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getDoctorAppointment(userId);
        getUserAppointment(userId);
      }
    } catch (error) {
      console.error(error);
      message.error('Something went wrong while updating status');
    }
  };

  const handleDownload = async (url, appointId) => {
    try {
      const res = await axios.get('http://localhost:8001/api/doctor/getdocumentdownload', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: { appointId },
        responseType: 'blob',
      });

      if (res.data) {
        const fileUrl = window.URL.createObjectURL(
          new Blob([res.data], { type: 'application/pdf' })
        );
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = url.split('/').pop();
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        message.error('Failed to download document');
      }
    } catch (error) {
      console.error(error);
      message.error('Something went wrong during document download');
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user) {
      const { _id, isdoctor } = user;
      setType(isdoctor);

      if (isdoctor) {
        getDoctorAppointment(_id);
      } else {
        getUserAppointment(_id);
      }
    } else {
      alert('No user data found in localStorage');
    }
  }, []);

  return (
    <div>
      <h2 className="p-3 text-center">All Appointments</h2>
      <Container>
        {type ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date of Appointment</th>
                <th>Phone</th>
                <th>Document</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctorAppointments.length > 0 ? (
                doctorAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.userInfo.fullName}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.userInfo.phone}</td>
                    <td>
                      <Button
                        variant="link"
                        onClick={() =>
                          handleDownload(appointment.document.path, appointment._id)
                        }
                      >
                        {appointment.document.filename}
                      </Button>
                    </td>
                    <td>{appointment.status}</td>
                    <td>
                      {appointment.status === 'approved' ? null : (
                        <Button
                          onClick={() =>
                            handleStatus(
                              appointment.userInfo._id,
                              appointment._id,
                              'approved'
                            )
                          }
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <Alert variant="info">
                      <Alert.Heading>No Appointments to show</Alert.Heading>
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Date of Appointment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {userAppointments.length > 0 ? (
                userAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.docName}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <Alert variant="info">
                      <Alert.Heading>No Appointments to show</Alert.Heading>
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default UserAppointments;
