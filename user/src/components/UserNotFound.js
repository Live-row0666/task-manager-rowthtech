import React from 'react'
// import ladybug from "../assets/images/ladybug.png"
// import { Link } from 'react-router-dom'
// import { logoutUser } from '../redux/actions'

const UserNotFound = () => {
    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="text-center">
                {/* <span> <img src={ladybug} alt="" className='w-50 bg-none' /></span> */}
                <h1 className="display-1 fw-bold text-danger">404</h1>
                <h3 className="fs-1"> <span className="text-danger me-2">Opps!</span>User not found.</h3>
                <h4 className="lead text-dark mt-3">
                    The User you’re looking for doesn’t exist.
                </h4>
                {/* <Link onClick={() => {
                    dispatch(logoutUser());
                }} to={"/account/login"} className="dropdown-item notify-item" key={i + '-profile-menu'}>
                    <i className={classNames(item.icon, 'me-1')}></i>
                    <span>{item.label}</span>
                </Link> */}
                {/* <Link to="/account/login" className="btn btn-outline-info rounded-pill mt-3  ">Go Back Home</Link> */}
            </div>
        </div>

    )
}

export default UserNotFound
