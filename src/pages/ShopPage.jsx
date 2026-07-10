import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./styles/sellsPage.css";
import "../components/ProductCard";
import ProductCard from "../components/ProductCard";

function SellPage(){
  return(
<>
<Navbar/>
<ProductCard/>
      <Footer />
</>
  )
}


export default SellPage;