"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Cookies from 'js-cookie';

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      firstname: "",
      lastname: "",
      email: "",
      id: "",
      type: "",
      interest: [],
      location: [],
      addr: "",
      phone: "",
      city: "",
      zip: "",
      appliedAt: "",
      acceptedAt: "",
      roles: [],
      permissions: [],
      setUserData: (userData, isLoggedIn) => {
        if (!userData?.message) {
          console.error('Invalid user data structure:', userData);
          return;
        }
        
        const user = userData.message;
        
        // Extract permissions from roles if permissions array is not provided
        let permissions = user.permissions || [];
        
        // Ensure permissions is an array
        if (!Array.isArray(permissions)) {
          permissions = [];
        }
        
        // Always extract permissions from roles and combine with direct permissions
        if (user.roles && Array.isArray(user.roles)) {
          // Flatten permissions from all roles
          const rolePermissions = user.roles.reduce((acc, role) => {
            let rolePerms = role.permissions;
            // Handle JSON string
            if (typeof rolePerms === 'string') {
              try {
                rolePerms = JSON.parse(rolePerms);
              } catch (e) {
                rolePerms = [];
              }
            }
            // Ensure it's an array
            if (Array.isArray(rolePerms)) {
              return [...acc, ...rolePerms];
            }
            return acc;
          }, []);
          // Combine direct permissions with role permissions and remove duplicates
          permissions = [...new Set([...permissions, ...rolePermissions])];
        }
        
        // Ensure roles are properly formatted
        const formattedRoles = (user.roles || []).map(role => {
          let rolePerms = role.permissions;
          if (typeof rolePerms === 'string') {
            try {
              rolePerms = JSON.parse(rolePerms);
            } catch (e) {
              rolePerms = [];
            }
          }
          if (!Array.isArray(rolePerms)) {
            rolePerms = [];
          }
          return {
            id: role.id,
            roleTitle: role.roleTitle || role.name || role.id,
            permissions: rolePerms,
          };
        });
        
        console.log('Setting user data:', {
          id: user.id,
          email: user.email,
          rawRoles: user.roles,
          formattedRoles: formattedRoles,
          rawPermissions: user.permissions,
          finalPermissions: permissions,
        });
        
        set({
          isLoggedIn: isLoggedIn,
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          email: user.email || "",
          id: user.id || "",
          type: user.type || "",
          interest: user.interest || [],
          location: user.location || [],
          addr: user.addr || "",
          phone: user.phone || "",
          city: user.city || "",
          zip: user.zip || "",
          appliedAt: user.appliedAt || "",
          acceptedAt: user.acceptedAt || "",
          roles: formattedRoles,
          permissions: permissions,
        });
      },
      logout: async() => {
        // Remove cookie using js-cookie
        Cookies.remove('session_token');
        
        set({
          isLoggedIn: false,
          firstname: "",
          lastname: "",
          email: "",
          id: "",
          type: "",
          interest: [],
          location: [],
          addr: "",
          phone: "",
          city: "",
          zip: "",
          appliedAt: "",
          acceptedAt: "",
          roles: [],
          permissions: [],
        });
      },
      clearAuth: () => {
        // Clear all auth data (for auto-logout)
        Cookies.remove('session_token');
        
        set({
          isLoggedIn: false,
          firstname: "",
          lastname: "",
          email: "",
          id: "",
          type: "",
          interest: [],
          location: [],
          addr: "",
          phone: "",
          city: "",
          zip: "",
          appliedAt: "",
          acceptedAt: "",
          roles: [],
          permissions: [],
        });
      },
      clearCache: () => {
        // Clear localStorage cache
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        // Reset state
        set({
          isLoggedIn: false,
          firstname: "",
          lastname: "",
          email: "",
          id: "",
          type: "",
          interest: [],
          location: [],
          addr: "",
          phone: "",
          city: "",
          zip: "",
          appliedAt: "",
          acceptedAt: "",
          roles: [],
          permissions: [],
        });
      },
    }),
    {
      name: "auth-storage",
      // Only persist these fields
      partialize: (state) => ({
          isLoggedIn: state.isLoggedIn,
          firstname: state.firstname,
          lastname: state.lastname,
          email: state.email,
          id: state.id,
          type: state.type,
          interest: state.interest,
          location: state.location,
          addr: state.addr,
          phone: state.phone,
          city: state.city,
          zip: state.zip,
          appliedAt: state.appliedAt,
          acceptedAt: state.acceptedAt,
          roles: state.roles,
          permissions: state.permissions,
      }),
    }
  )
);
