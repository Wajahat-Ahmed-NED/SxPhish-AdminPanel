import React from 'react';
import { IoMdContacts } from 'react-icons/io';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdOutlineAccountCircle } from 'react-icons/md';


const userGridImage = (props) => (
  <div className="image flex gap-4">
    <img
      className="rounded-full w-10 h-10"
      src={props.userImage}
      alt="user"
    />
    <div>
      <p>{props.userName}</p>
      <p>{props.userEmail}</p>
    </div>
  </div>
);

const userGridStatus = (props) => (
  <div className="flex gap-2 justify-center items-center text-gray-700 capitalize ">
    <p style={{ background: props.StatusBg }} className="rounded-full h-3 w-3" />
    <p>{props.Status}</p>
  </div>
);
export const areaPrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'y',
  majorGridLines: { width: 0 },
  intervalType: 'Years',
  edgeLabelPlacement: 'Shift',
  labelStyle: { color: 'gray' },
};


export const usersGrid = [
  { type: 'checkbox', width: '50' },
  { headerText: 'User',
    width: '160',
    template: userGridImage,
    textAlign: 'Center' },
  // { field: 'UserName',
  //   headerText: 'User Name',
  //   width: '150',
  //   textAlign: 'Center' },
    { field: 'PhoneNumber',
    headerText: 'Phone Number',
    width: '140',
    format: 'yMd',
    textAlign: 'Center' },
  { field: 'Status',
    headerText: 'Status',
    width: '130',
    format: 'yMd',
    textAlign: 'Center',
    template: userGridStatus },
  
  { field: 'Location',
    headerText: 'Location',
    width: '150',
    textAlign: 'Center' },

  { field: 'MobileIMI',
    headerText: 'Mobile IMI',
    width: '120',
    textAlign: 'Center',
    isPrimaryKey: true,
  },
  { field: 'IsBlocked',
    headerText: 'IS Blocked?',
    width: '130',
    format: 'yMd',
    textAlign: 'Center',
    // template: userGridStatus 
  },
];

export const logout = [
  {
    title: 'Logout',
    links:[
      {
        name: 'Logout',
        icon:<FaSignOutAlt />,
      }
    ]
  }
];
export const links = [
  // {
  //   title: 'Dashboard',
  //   links: [
  //     {
  //       name: 'Overview',
  //       icon: <FaUsers />,
  //     },
  //   ],
  // },

  {
    title: 'Pages',
    links: [
      {
        name: 'Users',
        icon: <IoMdContacts />,
      },
    ],
  },
];


export const userProfileData = [
  {
    title: 'Profile',
    links:[
      {
        name: 'Profile',
        icon:<MdOutlineAccountCircle />,
      }
    ]
  }
];

export const contextMenuItems = [
  'AutoFit',
  'AutoFitAll',
  'SortAscending',
  'SortDescending',
  'Copy',
  'Edit',
  'Delete',
  'Save',
  'Cancel',
  'PdfExport',
  'ExcelExport',
  'CsvExport',
  'FirstPage',
  'PrevPage',
  'LastPage',
  'NextPage',
];
