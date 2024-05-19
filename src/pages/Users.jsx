import React, { useRef, useEffect, useState } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Selection, Inject, Edit, Toolbar, Sort, Filter } from '@syncfusion/ej2-react-grids';
import { ClipLoader } from 'react-spinners';
import { Header } from '../components';
import Switch from 'react-switch';
import Button from '@mui/material/Button';

const Users = () => {
  const selectionsettings = { persistSelection: true };

  const gridInstance = useRef(null);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsersList();
  }, []); // Fetch data on component mount

  const fetchUsersList = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users'); // Fetch data from backend API
      if (response.ok) {
        const result = await response.json();
        setUsersData(result);
      } else {
        console.error('Failed to fetch users list');
      }
    } catch (error) {
      console.error('Error fetching users list:', error.message);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  const handleSwitchChange = async (checked, columnName, rowIndex) => {
    try {
      const userToUpdate = usersData[rowIndex];
      if (userToUpdate && columnName) {
        console.log('columnName:', columnName);
        console.log('checked:', checked);
        
        // Construct request body
        const requestBody = {
          virus_total: usersData[rowIndex].virus_total,
          the_phish: usersData[rowIndex].the_phish,
          sms_whatsapp_phishing: usersData[rowIndex].sms_whatsapp_phishing,
          [columnName]: checked ? 1 : 0
        };
        console.log('requestBody:', requestBody);
  
        const response = await fetch(`http://localhost:3001/api/users/${userToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        if (response.ok) {
          const updatedUsersData = [...usersData];
          updatedUsersData[rowIndex][columnName] = checked ? 1 : 0;
          setUsersData(updatedUsersData);
        } else {
          console.error('Failed to update user status');
        }
      } else {
        console.error('Invalid columnName or userToUpdate');
      }
    } catch (error) {
      console.error('Error updating user status:', error.message);
    }
  };

  function add365Days(inputDate) {
    // Parse the input date
    const date = new Date(inputDate);
  
    // Check if the input date is valid
    if (isNaN(date)) {
      throw new Error("Invalid date");
    }
  
    // Add 365 days to the date
    date.setDate(date.getDate() + 365);
  
    return date;
  }
  
const handleGenerateKey=async (username)=>{
  try{

    let response=await fetch(`http://localhost:3001/api/generateKey/${username}`,{
      method:"GET",
      headers:{
        'Content-Type': 'application/json'
      }
    })
    
    let data=await response.json();
    console.log(data);
    fetchUsersList();
    alert("Key successfully generated")
  }
  catch(err){
    console.log(err)
    alert("Key could not generate")
  }
}
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-main-dark-bg rounded-3xl">
      <Header category="Page" title="Users" />
      {loading ? (
        // Render loader when data is still loading
        <div className="flex justify-center items-center h-screen bg-secondary-dark-bg">
          <ClipLoader color="#fff" size={100} />
        </div>
      ) : (
        // Render the grid once data is loaded
        <GridComponent
          dataSource={usersData}
          allowPaging
          pageSettings={{ pageCount: 5 }}
          selectionSettings={selectionsettings}
          allowSorting
          ref={gridInstance}
        >
          <ColumnsDirective>
            <ColumnDirective field="id" headerText="User ID" isPrimaryKey={true} />
            <ColumnDirective field="username" headerText="Username" />
            <ColumnDirective field="licenseKey" headerText="License Key" width={350} template={(row)=>(row.licenseKey || "-")}/>
            <ColumnDirective field="payment_date" headerText="Payment Date" template={(row)=>{
              if(row.payment_date){
                return new Date(row.payment_date).toLocaleDateString().split('/')[2]+"-"+new Date(row.payment_date).toLocaleDateString().split('/')[0]+"-"+new Date(row.payment_date).toLocaleDateString().split('/')[1];
              }
              return "-"
              }}/>
            <ColumnDirective field="payment_date" headerText="Expiry Date" template={(row)=>{
              if(row.payment_date){
                return add365Days(row.payment_date).toISOString().split("T")[0]
              }
              return "-"
            }} />

<ColumnDirective
  headerText="Generate Key"
  template={(rowData) => (
    <Button variant="contained" disabled={rowData.licenseKey || rowData.username=='admin'} size='small' onClick={()=>handleGenerateKey(rowData.username)}>
     Key
  </Button>
  )}
  width={120}
/>
          </ColumnsDirective>
          <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
        </GridComponent>
      )}
    </div>
  );
};

export default Users;
