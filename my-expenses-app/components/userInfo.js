import { React, useState, useEffect, useCallback } from "react";
import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';
import Modal from 'react-modal';
// import SearchMap from "./updateUserInfo.js";

const UserInfo = ({ email }) => {
    const [userInfo, setUserInfo] = useState({
        username: '',
        phonenumber: '',
        location: '',
        carSize: 0,
        discordUsername: ''
    });

    const getUserInfo = useCallback(async () => {
        try {
            // console.log('Getting user Info');
            const documentRef = doc(db, "users", email);

            const docSnap = await getDoc(documentRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserInfo({
                    username: data.username,
                    phonenumber: data.phonenumber,
                    location: data.locationName,
                    carSize: data.carSize,
                    discordUsername: data.discordusername
                });
            }
        } catch (error) {
            console.error('Error getting user information:', error);
        }
    }, [email]);

    useEffect(() => {
        getUserInfo();
    }, [email, getUserInfo]);

    const Popup = ({ }) => {
        const [modalIsOpen, setModalIsOpen] = useState(false);

        const openModal = (event) => {
            if (!event.target.closest('.ModalContent')) {
                setModalIsOpen(true);
            }
        };

        const closeModal = () => {
            getUserInfo();
            setModalIsOpen(false);
            window.location.reload();

        };

        return (
            <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                <button onClick={openModal}>Update Personal Details</button>
                <Modal
                    className="ModalContent"
                    contentLabel="Edit Personal Details"
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    shouldCloseOnOverlayClick={false}
                    shouldCloseOnEsc={true}
                    ariaHideApp={false}
                >
                    <div className="bg-gray-100 w-1/2 h-5/6 mx-auto flex flex-col items-center p-8 rounded-lg">
                        <h1 className="font-semibold text-2xl mb-4">Edit Personal Details</h1>
                        {/* <SearchMap email={email} /> */}
                        <button
                            className="border border-gray-300 rounded-md px-4 py-2 bg-white hover:bg-gray-200 focus:outline-none mt-4"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div className='border border-gray-300 rounded-lg bg-gray-100 inline-block p-4 text-sm sm:text-base md:text-lg lg:text-xl'>
            <div className="space-y-4">
                <h2 className="font-semibold">Current Info:</h2>
                <div className="space-y-2">
                    <h3><span className="font-semibold">Name:</span> {userInfo.username}</h3>
                    <h3><span className="font-semibold">Phone Number:</span> {userInfo.phonenumber}</h3>
                    <h3><span className="font-semibold">Location:</span> {userInfo.location}</h3>
                    <h3><span className="font-semibold">Email:</span> {email}</h3>
                    <h3><span className="font-semibold">Car Size:</span> {userInfo.carSize}</h3>
                    <h3><span className="font-semibold">Discord Username:</span> {userInfo.discordUsername}</h3>
                </div>
                <Popup />
            </div>
        </div>

    );
};

export default UserInfo;
