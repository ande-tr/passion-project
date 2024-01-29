import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Exercises(){
    const [exerciseNames, setExerciseNames] = useState([]);
    const [deleteExercise, setDeleteExercise] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const keys = Object.keys(localStorage);
        setExerciseNames(keys);
    }, []);


    const handleDeleteExercise = (exerciseName) => {
        setDeleteExercise(exerciseName);
    };

    const confirmDeleteExercise = () => {
        if (deleteExercise) {
            localStorage.removeItem(deleteExercise);
            setExerciseNames((prevExerciseNames) =>
                prevExerciseNames.filter((name) => name !== deleteExercise)
            );
            setDeleteExercise(null);
        }
    };

    const cancelDeleteExercise = () => {
        setDeleteExercise(null);
    };

    const handleSelectExercise = (exerciseName) => {
        console.log(exerciseName);
        navigate(`/play/${exerciseName}`);
    }

    return (
        <div className='Exercises'>
            <header>Exercises</header>

            {deleteExercise && (
                <div className="modal">
                    <div className="modal-content">
                        <p className='modal__question'>Are you sure you want to permanently delete <span className='bold-text'>{deleteExercise}</span>?</p>
                        <div className='modal-btns'>
                            <button className='modal-button modal-button__cancel' onClick={cancelDeleteExercise}>No</button>
                            <button className='modal-button modal-button__delete' onClick={confirmDeleteExercise}>Yes</button>
                        </div>
                    </div>
                </div>
            )}

            <ul className='exercises-list'>
                {exerciseNames.map((exerciseName) => (
                    <li className='exercise' key={exerciseName}>
                        <div className='exercise__name'>{exerciseName}</div>
                        <div className='exercise__btns'>
                            <button onClick={() => handleSelectExercise(exerciseName)} className='icon-button exercise__btns__play'>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                    <path fill="#41B8B9" d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                                </svg>
                            </button>
                            <button onClick={() => handleDeleteExercise(exerciseName)} className='icon-button exercise__btns__delete'>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                    <path fill="#E13A52" d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                                </svg>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Exercises;