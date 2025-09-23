// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db, storage } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

// --- Company Operations ---

// Fetch all companies
export const fetchAllCompanies = async () => {
  try {
    const companiesSnapshot = await getDocs(collection(db, "companies"));
    const companies = companiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error("Error fetching companies");
  }
};


export const fetchClientCompanies = async () => {
  try {
    const companiesSnapshot = await getDocs(collection(db, "companies"));
    const companies = companiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Find the company with name 'Kyrotics'
    const kyroticsCompany = companies.find(company => company.name === "Kyrotics");

    if (!kyroticsCompany) {
      throw new Error("Kyrotics company not found");
    }

    // Filter out 'Kyrotics' and return the rest
    const filteredCompanies = companies.filter(company => company.id !== kyroticsCompany.id);

    return filteredCompanies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error("Error fetching companies");
  }
};



export const fetchCompanyNameByCompanyId = async (companyId) => {
  try {
    if (!companyId || companyId === "") {
      // If companyId is invalid or empty, return a default value
      return "No company";
    }

    const companyDocRef = doc(db, "companies", companyId);
    const companyDoc = await getDoc(companyDocRef);

    if (companyDoc.exists()) {
      return companyDoc.data().name;
    } else {
      throw new Error("Company not found");
    }
  } catch (error) {
    console.error("Error fetching company name:", error);
    throw error;
  }
};


export const kyroCompanyId = async () => {
  try {
    // Fetch all documents from the companies collection
    const companiesSnapshot = await getDocs(collection(db, "companies"));
    
    // Map through the documents to extract company data
    const companies = companiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Find the company where the name is 'Kyrotics'
    const kyroticsCompany = companies.find(company => company.name === "Kyrotics");

    // If company not found, throw an error
    if (!kyroticsCompany) {
      throw new Error("Kyrotics company not found");
    }

    // Return the ID of the Kyrotics company
    return kyroticsCompany.id;
  } catch (error) {
    console.error("Error fetching Kyrotics company:", error);
    throw new Error("Error fetching Kyrotics company");
  }
};



// Fetch all projects for a specific company
export const fetchCompanyProjects = async (companyId) => {
  try {
    const projectsQuery = query(
      collection(db, "projects"),
      where("companyId", "==", companyId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Error fetching projects");
  }
};
// Fetch all users for a specific company
export const fetchCompanyUsers = async (companyId) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("companyId", "==", companyId),
      where("roleId", "==", "vHy9iTgtdYglS3yxf0s9")
    );
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  }
  catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
}