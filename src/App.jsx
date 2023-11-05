import { Routes, Route } from 'react-router-dom';
import './App.css'
// import RegisterProperty from './components/RegisterProperty';
import IndexPage from "./pages/index";

function App() {
  return (
    <>
      {/* <RegisterProperty/> */}
      
      <Routes>
        <Route path="/" element={<IndexPage/>}  />
      </Routes>
    </>
  )
}

export default App
