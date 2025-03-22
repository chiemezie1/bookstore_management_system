import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { createId } from "@paralleldrive/cuid2"
import { format, differenceInDays } from "date-fns"

// Define types for better type safety
type Role = {
  id?: string
  roleCode: string
  name: string
  description: string
  accessLevel: number
}

type Department = {
  id?: string
  deptCode: string
  name: string
  description: string
  location: string
  isActive?: boolean
}

type Ward = {
  id?: string
  name: string
  description: string
  location: string
  capacity: number
  departmentId: string
  isActive?: boolean
}

type Bed = {
  id?: string
  bedNumber: string
  status: "available" | "occupied" | "maintenance"
  notes?: string
  wardId: string
}

type User = {
  id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  status: "active" | "pending" | "inactive"
  roleId: string
  departmentId?: string
}

type StaffRequirement = {
  id?: string
  roleId: string
  minStaff: number
  shiftsPerDay: number
  shiftType: string
}

type StaffWorkingHours = {
  id?: string
  staffId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive?: number
}

type StaffAttendance = {
  id?: string
  staffId: string
  checkInTime: Date
  checkOutTime?: Date
  totalHours?: number
  overtimeHours?: number
  status: "present" | "absent" | "late"
  notes?: string
}

type Admission = {
  id?: string
  admissionNumber: string
  bedNumber: string
  admissionDate: Date
  dischargeDate?: Date
  expectedStayDuration?: number
  admissionType: string
  status: "admitted" | "discharged"
  diagnosis?: string
  notes?: string
  patientId: string
  wardId: string
  admittedById: string
  dischargedById?: string
}

type DoctorRating = {
  id?: string
  patientId: string
  doctorId: string
  rating: number
  review?: string
  isAnonymous: number
  isVisible: number
}

type ServiceRating = {
  id?: string
  patientId: string
  departmentId: string
  serviceType: string
  rating: number
  review?: string
  isAnonymous: number
  isVisible: number
}

type HousekeepingTask = {
  id?: string
  taskType: string
  locationType: string
  priority: "high" | "medium" | "normal" | "low"
  status: "pending" | "in_progress" | "completed" | "verified"
  scheduledTime: Date
  startTime?: Date
  completionTime?: Date
  verificationTime?: Date
  notes?: string
  locationId: string
  assignedToId?: string
  verifiedById?: string
  createdById: string
}

type ShiftSwapRequest = {
  id?: string
  requesterId: string
  swapWithId?: string
  shiftDate: Date
  requestedShift: string
  status: "pending" | "accepted" | "rejected"
}

type ResignationRequest = {
  id?: string
  staffId: string
  reason?: string
  status: "pending" | "accepted" | "rejected"
}

const prisma = new PrismaClient()

// Constants
const START_DATE = new Date("2025-02-01T00:00:00Z")
const END_DATE = new Date("2025-03-01T23:59:59Z")
const TOTAL_DAYS = differenceInDays(END_DATE, START_DATE) + 1
const TOTAL_BEDS = 100
const TOTAL_WARDS = 4
const BEDS_PER_WARD = TOTAL_BEDS / TOTAL_WARDS
const TOTAL_PATIENTS = 20

// Portal to role code mapping
const PORTAL_ROLE_MAPPING = {
  "/admin-portal": ["AD"],
  "/doctor-portal": ["DO"],
  "/patient-portal": ["PA"],
  "/staff-portal": ["NR", "ST"],
  "/admissions-portal": ["RC"],
  "/cleaning-portal": ["CL"],
  "/emergency-portal": ["EM"],
  "/pharmacy-portal": ["PH"],
  "/laboratory-portal": ["LT"],
  "/radiology-portal": ["RA"],
  "/it-portal": ["IT"],
  "/inventory-portal": ["IN"],
  "/finance-portal": ["FI"],
}

// Utility functions
const formatDate = (date: Date) => format(date, "yyyy-MM-dd")
const formatDateTime = (date: Date) => format(date, "yyyy-MM-dd HH:mm:ss")
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomDecimal = (min: number, max: number, decimals = 1) => {
  const factor = Math.pow(10, decimals)
  return Math.round((min + Math.random() * (max - min)) * factor) / factor
}

async function main() {
  console.log("\n🏥 Hospital Management System - Database Initialization")
  console.log("====================================================")
  console.log(`Period: ${formatDate(START_DATE)} to ${formatDate(END_DATE)}`)
  console.log(`Configuration: ${TOTAL_PATIENTS} patients, ${TOTAL_BEDS} beds, ${TOTAL_WARDS} wards`)

  try {
    // Step 1: Create roles
    console.log("\n👥 Step 1: Creating roles...")
    const rolesData: Role[] = [
      { roleCode: "AD", name: "Administrator", description: "System administrator with full access", accessLevel: 10 },
      { roleCode: "DO", name: "Doctor", description: "Medical practitioner", accessLevel: 8 },
      { roleCode: "NR", name: "Nurse", description: "Nursing staff", accessLevel: 7 },
      { roleCode: "RC", name: "Receptionist", description: "Front desk staff", accessLevel: 5 },
      { roleCode: "LT", name: "Lab Technician", description: "Laboratory staff", accessLevel: 6 },
      { roleCode: "RA", name: "Radiologist", description: "Radiology department staff", accessLevel: 6 },
      { roleCode: "PH", name: "Pharmacist", description: "Pharmacy staff", accessLevel: 6 },
      { roleCode: "CL", name: "Cleaning Staff", description: "Housekeeping personnel", accessLevel: 3 },
      { roleCode: "IT", name: "IT Support", description: "Technical support staff", accessLevel: 7 },
      { roleCode: "PA", name: "Patient", description: "Hospital patient", accessLevel: 1 },
      { roleCode: "ST", name: "General Staff", description: "General hospital staff", accessLevel: 4 },
      { roleCode: "EM", name: "Emergency Staff", description: "Emergency department staff", accessLevel: 8 },
      { roleCode: "IN", name: "Inventory Staff", description: "Inventory management staff", accessLevel: 5 },
      { roleCode: "FI", name: "Finance Staff", description: "Finance department staff", accessLevel: 6 },
    ]

    const roleMap = new Map<string, string>()

    for (const role of rolesData) {
      try {
        const createdRole = await prisma.role.upsert({
          where: { roleCode: role.roleCode },
          update: {
            name: role.name,
            description: role.description,
            accessLevel: role.accessLevel,
          },
          create: {
            id: createId(),
            roleCode: role.roleCode,
            name: role.name,
            description: role.description,
            accessLevel: role.accessLevel,
          },
        })
        roleMap.set(role.roleCode, createdRole.id)
        console.log(`✅ Role: ${role.name} (${role.roleCode})`)
      } catch (error) {
        console.error(`❌ Error with role ${role.name}:`, error)
      }
    }

    // Step 2: Create departments
    console.log("\n🏢 Step 2: Creating departments...")
    const departmentsData: Department[] = [
      {
        deptCode: "ADMIN",
        name: "Administration",
        description: "Hospital administration",
        location: "Building A, Floor 1",
      },
      { deptCode: "ER", name: "Emergency", description: "Emergency department", location: "Building A, Ground Floor" },
      {
        deptCode: "ICU",
        name: "Intensive Care Unit",
        description: "Critical care unit",
        location: "Building B, Floor 2",
      },
      { deptCode: "SURG", name: "Surgery", description: "Surgical department", location: "Building B, Floor 3" },
      { deptCode: "PEDS", name: "Pediatrics", description: "Children's healthcare", location: "Building C, Floor 1" },
      { deptCode: "CARD", name: "Cardiology", description: "Heart care unit", location: "Building B, Floor 4" },
      { deptCode: "NEURO", name: "Neurology", description: "Neurological care", location: "Building B, Floor 5" },
      { deptCode: "RAD", name: "Radiology", description: "Imaging services", location: "Building A, Floor 2" },
      { deptCode: "LAB", name: "Laboratory", description: "Medical testing", location: "Building A, Floor 2" },
      {
        deptCode: "PHARM",
        name: "Pharmacy",
        description: "Medication dispensary",
        location: "Building A, Ground Floor",
      },
      {
        deptCode: "CLEAN",
        name: "Housekeeping",
        description: "Cleaning services",
        location: "Building D, Ground Floor",
      },
      { deptCode: "IT", name: "IT Department", description: "Technical support", location: "Building D, Floor 1" },
      { deptCode: "INV", name: "Inventory", description: "Inventory management", location: "Building D, Floor 2" },
      { deptCode: "FIN", name: "Finance", description: "Financial services", location: "Building A, Floor 3" },
    ]

    const departmentMap = new Map<string, string>()

    for (const dept of departmentsData) {
      try {
        const createdDept = await prisma.department.upsert({
          where: { deptCode: dept.deptCode },
          update: {
            name: dept.name,
            description: dept.description,
            location: dept.location,
            isActive: true,
          },
          create: {
            id: createId(),
            deptCode: dept.deptCode,
            name: dept.name,
            description: dept.description,
            location: dept.location,
            isActive: true,
          },
        })
        departmentMap.set(dept.deptCode, createdDept.id)
        console.log(`✅ Department: ${dept.name} (${dept.deptCode})`)
      } catch (error) {
        console.error(`❌ Error with department ${dept.name}:`, error)
      }
    }

    // Step 3: Create staff requirements
    console.log("\n👨‍⚕️ Step 3: Creating staff requirements...")
    const staffRequirementsData: StaffRequirement[] = []

    for (const [roleCode, roleId] of roleMap.entries()) {
      if (roleCode !== "PA") {
        const minStaff =
          roleCode === "AD"
            ? 2
            : roleCode === "DO"
              ? 8
              : roleCode === "NR"
                ? 16
                : roleCode === "RC"
                  ? 4
                  : roleCode === "LT"
                    ? 4
                    : roleCode === "RA"
                      ? 4
                      : roleCode === "PH"
                        ? 3
                        : roleCode === "CL"
                          ? 6
                          : roleCode === "EM"
                            ? 6
                            : roleCode === "IN"
                              ? 3
                              : roleCode === "FI"
                                ? 3
                                : 2

        const shiftsPerDay = ["DO", "NR", "RC", "EM"].includes(roleCode) ? 3 : 1
        const shiftType = shiftsPerDay === 3 ? "24/7 coverage with 3 shifts" : "8-hour shifts, 5 days a week"

        staffRequirementsData.push({
          roleId,
          minStaff,
          shiftsPerDay,
          shiftType,
        })
      }
    }

    for (const req of staffRequirementsData) {
      try {
        await prisma.staffRequirement.create({
          data: {
            id: createId(),
            roleId: req.roleId,
            minStaff: req.minStaff,
            shiftsPerDay: req.shiftsPerDay,
            shiftType: req.shiftType,
          },
        })

        const role = await prisma.role.findUnique({ where: { id: req.roleId } })
        console.log(`✅ Staff Requirement: ${role?.name} - ${req.minStaff} staff, ${req.shiftsPerDay} shifts`)
      } catch (error) {
        console.error(`❌ Error with staff requirement:`, error)
      }
    }

    // Step 4: Create wards
    console.log("\n🏥 Step 4: Creating wards...")
    const wardNames = ["General Ward", "Surgical Ward", "Pediatric Ward", "Cardiac Ward"]
    const wardsData: Ward[] = []
    const wardMap = new Map<string, string>()

    for (let i = 0; i < TOTAL_WARDS; i++) {
      const departmentId = departmentMap.get(["ICU", "SURG", "PEDS", "CARD"][i]) || departmentMap.get("ADMIN")!

      wardsData.push({
        name: wardNames[i],
        description: `${wardNames[i]} for patient care`,
        location: `Building ${String.fromCharCode(65 + i)}, Floor ${i + 1}`,
        capacity: BEDS_PER_WARD,
        departmentId,
        isActive: true,
      })
    }

    for (const ward of wardsData) {
      try {
        const createdWard = await prisma.ward.create({
          data: {
            id: createId(),
            name: ward.name,
            description: ward.description,
            location: ward.location,
            capacity: ward.capacity,
            departmentId: ward.departmentId,
            isActive: ward.isActive,
          },
        })
        wardMap.set(ward.name, createdWard.id)
        console.log(`✅ Ward: ${ward.name} (${ward.capacity} beds)`)
      } catch (error) {
        console.error(`❌ Error with ward ${ward.name}:`, error)
      }
    }

    // Step 5: Create beds
    console.log("\n🛏️ Step 5: Creating beds...")
    const bedsData: Bed[] = []
    const bedMap = new Map<string, string>()

    for (let i = 0; i < TOTAL_WARDS; i++) {
      const wardId = wardMap.get(wardNames[i])!

      for (let j = 0; j < BEDS_PER_WARD; j++) {
        const bedNumber = `${String.fromCharCode(65 + i)}${j + 1}`.padStart(3, "0")

        bedsData.push({
          bedNumber,
          status: "available",
          notes: `Bed ${bedNumber} in ${wardNames[i]}`,
          wardId,
        })
      }
    }

    for (const bed of bedsData) {
      try {
        const createdBed = await prisma.bed.create({
          data: {
            id: createId(),
            bedNumber: bed.bedNumber,
            status: bed.status,
            notes: bed.notes,
            wardId: bed.wardId,
          },
        })
        bedMap.set(bed.bedNumber, createdBed.id)
      } catch (error) {
        console.error(`❌ Error with bed ${bed.bedNumber}:`, error)
      }
    }
    console.log(`✅ Created ${bedsData.length} beds across ${TOTAL_WARDS} wards`)

    // Step 6: Create users (staff and patients)
    console.log("\n👤 Step 6: Creating users...")
    const usersData: User[] = []
    const staffByRole = new Map<string, string[]>()
    const patientIds: string[] = []

    // Create staff for each role based on requirements
    for (const [roleCode, roleId] of roleMap.entries()) {
      if (roleCode !== "PA") {
        const staffCount =
          roleCode === "AD"
            ? 2
            : roleCode === "DO"
              ? 8
              : roleCode === "NR"
                ? 16
                : roleCode === "RC"
                  ? 4
                  : roleCode === "LT"
                    ? 4
                    : roleCode === "RA"
                      ? 4
                      : roleCode === "PH"
                        ? 3
                        : roleCode === "CL"
                          ? 6
                          : roleCode === "EM"
                            ? 6
                            : roleCode === "IN"
                              ? 3
                              : roleCode === "FI"
                                ? 3
                                : 2

        staffByRole.set(roleCode, [])

        for (let i = 0; i < staffCount; i++) {
          const firstName = `${roleCode.charAt(0)}${roleCode.charAt(1)}${i + 1}First`
          const lastName = `${roleCode.charAt(0)}${roleCode.charAt(1)}${i + 1}Last`
          const email = `${roleCode.toLowerCase()}${i + 1}@hospital.org`
          const gender = i % 2 === 0 ? "male" : "female"
          const dob = formatDate(new Date(1980 + i, i % 12, (i % 28) + 1))

          const departmentId =
            roleCode === "AD"
              ? departmentMap.get("ADMIN")
              : roleCode === "DO"
                ? departmentMap.get(["ER", "ICU", "SURG", "PEDS", "CARD", "NEURO"][i % 6])
                : roleCode === "NR"
                  ? departmentMap.get(["ER", "ICU", "SURG", "PEDS", "CARD", "NEURO"][i % 6])
                  : roleCode === "RC"
                    ? departmentMap.get("ADMIN")
                    : roleCode === "LT"
                      ? departmentMap.get("LAB")
                      : roleCode === "RA"
                        ? departmentMap.get("RAD")
                        : roleCode === "PH"
                          ? departmentMap.get("PHARM")
                          : roleCode === "CL"
                            ? departmentMap.get("CLEAN")
                            : roleCode === "EM"
                              ? departmentMap.get("ER")
                              : roleCode === "IN"
                                ? departmentMap.get("INV")
                                : roleCode === "FI"
                                  ? departmentMap.get("FIN")
                                  : departmentMap.get("IT")

          usersData.push({
            email,
            password: `${roleCode.toLowerCase()}123`,
            firstName,
            lastName,
            phone: `555-${100 + i}-${1000 + i}`,
            dateOfBirth: dob,
            gender,
            status: "active",
            roleId,
            departmentId,
          })
        }
      }
    }

    // Create patients
    for (let i = 0; i < 50; i++) {
      const firstName = `Patient${i + 1}First`
      const lastName = `Patient${i + 1}Last`
      const email = `patient${i + 1}@example.com`
      const gender = i % 2 === 0 ? "male" : "female"
      const dob = formatDate(new Date(1950 + i, i % 12, (i % 28) + 1))

      usersData.push({
        email,
        password: "patient123",
        firstName,
        lastName,
        phone: `555-${200 + i}-${2000 + i}`,
        dateOfBirth: dob,
        gender,
        status: "active",
        roleId: roleMap.get("PA")!,
      })
    }

    const userMap = new Map<string, string>()

    for (const user of usersData) {
      try {
        const hashedPassword = await hash(user.password, 10)

        const createdUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            firstName: user.firstName,
            lastName: user.lastName,
            password: hashedPassword,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            status: user.status,
            roleId: user.roleId,
            departmentId: user.departmentId,
          },
          create: {
            id: createId(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: hashedPassword,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            status: user.status,
            roleId: user.roleId,
            departmentId: user.departmentId,
          },
        })

        userMap.set(user.email, createdUser.id)

        // Store staff by role for later use
        const role = await prisma.role.findUnique({ where: { id: user.roleId } })
        if (role && role.roleCode !== "PA") {
          if (!staffByRole.has(role.roleCode)) {
            staffByRole.set(role.roleCode, [])
          }
          staffByRole.get(role.roleCode)!.push(createdUser.id)
        } else if (role && role.roleCode === "PA") {
          patientIds.push(createdUser.id)
        }
      } catch (error) {
        console.error(`❌ Error with user ${user.email}:`, error)
      }
    }

    console.log(
      `✅ Created ${usersData.length} users (${patientIds.length} patients, ${usersData.length - patientIds.length} staff)`,
    )

    // Step 7: Create staff working hours
    console.log("\n⏰ Step 7: Creating staff working hours...")
    const workingHoursData: StaffWorkingHours[] = []
    const shifts = [
      { start: "08:00", end: "16:00" }, // Morning
      { start: "16:00", end: "00:00" }, // Evening
      { start: "00:00", end: "08:00" }, // Night
    ]

    // Assign working hours to staff with 24/7 roles
    for (const roleCode of ["DO", "NR", "RC", "EM"]) {
      const staffIds = staffByRole.get(roleCode) || []

      for (let i = 0; i < staffIds.length; i++) {
        const staffId = staffIds[i]
        const shiftIndex = i % 3 // 0, 1, or 2 for morning, evening, night

        // Assign shifts for all days of the week
        for (let day = 0; day <= 6; day++) {
          workingHoursData.push({
            staffId,
            dayOfWeek: day,
            startTime: shifts[shiftIndex].start,
            endTime: shifts[shiftIndex].end,
            isActive: 1,
          })
        }
      }
    }

    // Assign working hours to staff with regular hours
    for (const roleCode of ["AD", "LT", "RA", "PH", "CL", "IT", "ST", "IN", "FI"]) {
      const staffIds = staffByRole.get(roleCode) || []

      for (const staffId of staffIds) {
        // Regular 9-5 weekday schedule
        for (let day = 1; day <= 5; day++) {
          workingHoursData.push({
            staffId,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
            isActive: 1,
          })
        }
      }
    }

    for (const hours of workingHoursData) {
      try {
        await prisma.staffWorkingHours.create({
          data: {
            id: createId(),
            staffId: hours.staffId,
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.startTime,
            endTime: hours.endTime,
            isActive: hours.isActive,
          },
        })
      } catch (error) {
        console.error(`❌ Error with working hours:`, error)
      }
    }

    console.log(`✅ Created ${workingHoursData.length} staff working hour records`)

    // Step 8: Create staff attendance
    console.log("\n📋 Step 8: Creating staff attendance records...")
    const attendanceData: StaffAttendance[] = []

    // Generate attendance records for each day in the period
    const currentDate = new Date(START_DATE)
    while (currentDate < END_DATE) {
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.

      // For each staff member
      for (const [roleCode, staffIds] of staffByRole.entries()) {
        // Skip weekends for non-24/7 staff
        const is24_7 = ["DO", "NR", "RC", "EM"].includes(roleCode)

        if (is24_7 || (dayOfWeek > 0 && dayOfWeek < 6)) {
          for (const staffId of staffIds) {
            // 90% chance of attendance, 10% chance of absence
            const isPresent = Math.random() < 0.9

            if (isPresent) {
              // Get the staff's shift for this day
              let startTime: Date, endTime: Date

              if (is24_7) {
                const staffIndex = staffIds.indexOf(staffId)
                const shiftIndex = staffIndex % 3

                const shift = shifts[shiftIndex]
                startTime = new Date(currentDate)
                startTime.setHours(
                  Number.parseInt(shift.start.split(":")[0]),
                  Number.parseInt(shift.start.split(":")[1]),
                  0,
                )

                endTime = new Date(currentDate)
                endTime.setHours(Number.parseInt(shift.end.split(":")[0]), Number.parseInt(shift.end.split(":")[1]), 0)

                // Adjust for overnight shifts
                if (endTime < startTime) {
                  endTime.setDate(endTime.getDate() + 1)
                }
              } else {
                // Regular 9-5 shift
                startTime = new Date(currentDate)
                startTime.setHours(9, 0, 0)

                endTime = new Date(currentDate)
                endTime.setHours(17, 0, 0)
              }

              // Add some randomness to check-in/out times (±15 minutes)
              const checkInVariance = Math.floor(Math.random() * 30) - 15
              const checkOutVariance = Math.floor(Math.random() * 30) - 15

              const checkInTime = new Date(startTime.getTime() + checkInVariance * 60000)
              const checkOutTime = new Date(endTime.getTime() + checkOutVariance * 60000)

              // Calculate total hours and overtime
              const totalHours = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 3600000) // hours
              const standardHours = is24_7 ? 8 : 8 // 8-hour shifts
              const overtimeHours = Math.max(0, totalHours - standardHours)

              attendanceData.push({
                staffId,
                checkInTime,
                checkOutTime,
                totalHours,
                overtimeHours,
                status: "present",
              })
            } else {
              // Absent
              attendanceData.push({
                staffId,
                checkInTime: currentDate,
                status: "absent",
                notes: "Sick leave",
              })
            }
          }
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    for (const attendance of attendanceData) {
      try {
        await prisma.staffAttendance.create({
          data: {
            id: createId(),
            staffId: attendance.staffId,
            checkInTime: attendance.checkInTime,
            checkOutTime: attendance.checkOutTime,
            totalHours: attendance.totalHours,
            overtimeHours: attendance.overtimeHours,
            status: attendance.status,
            notes: attendance.notes,
          },
        })
      } catch (error) {
        console.error(`❌ Error with attendance record:`, error)
      }
    }

    console.log(`✅ Created ${attendanceData.length} staff attendance records`)

    // Step 9: Create admissions
    console.log("\n🏥 Step 9: Creating patient admissions...")
    const admissionsData: Admission[] = []
    const admittedBeds = new Set<string>()

    // Get all beds
    const allBeds = await prisma.bed.findMany()

    // Admit 20 patients
    for (let i = 0; i < TOTAL_PATIENTS; i++) {
      const patientId = patientIds[i]

      // Find an available bed
      let bed
      do {
        bed = allBeds[Math.floor(Math.random() * allBeds.length)]
      } while (admittedBeds.has(bed.id))

      admittedBeds.add(bed.id)

      // Generate admission details
      const admissionDate = randomDate(START_DATE, new Date(END_DATE.getTime() - 3 * 24 * 60 * 60 * 1000)) // At least 3 days before end
      const expectedStayDuration = randomInt(3, 14) // 3 to 14 days

      // Some patients will be discharged during the period
      const willBeDischargedInPeriod = Math.random() < 0.7
      const dischargeDate = willBeDischargedInPeriod
        ? new Date(Math.min(END_DATE.getTime(), admissionDate.getTime() + expectedStayDuration * 24 * 60 * 60 * 1000))
        : undefined

      const doctorIds = staffByRole.get("DO") || []
      const admittingDoctorId = doctorIds[Math.floor(Math.random() * doctorIds.length)]
      const dischargingDoctorId = willBeDischargedInPeriod
        ? doctorIds[Math.floor(Math.random() * doctorIds.length)]
        : undefined

      admissionsData.push({
        admissionNumber: `ADM-${formatDate(admissionDate).replace(/-/g, "")}-${i + 1}`.padStart(15, "0"),
        bedNumber: bed.bedNumber,
        admissionDate,
        dischargeDate,
        expectedStayDuration,
        admissionType: ["Emergency", "Planned", "Transfer"][Math.floor(Math.random() * 3)],
        status: willBeDischargedInPeriod ? "discharged" : "admitted",
        diagnosis: `Sample diagnosis for patient ${i + 1}`,
        notes: `Admission notes for patient ${i + 1}`,
        patientId,
        wardId: bed.wardId,
        admittedById: admittingDoctorId,
        dischargedById: dischargingDoctorId,
      })
    }

    for (const admission of admissionsData) {
      try {
        const createdAdmission = await prisma.admission.create({
          data: {
            id: createId(),
            admissionNumber: admission.admissionNumber,
            bedNumber: admission.bedNumber,
            admissionDate: admission.admissionDate,
            dischargeDate: admission.dischargeDate,
            expectedStayDuration: admission.expectedStayDuration,
            admissionType: admission.admissionType,
            status: admission.status,
            diagnosis: admission.diagnosis,
            notes: admission.notes,
            patientId: admission.patientId,
            wardId: admission.wardId,
            admittedById: admission.admittedById,
            dischargedById: admission.dischargedById,
          },
        })

        // Update bed status - using id instead of bedNumber
        const bedToUpdate = allBeds.find((b) => b.bedNumber === admission.bedNumber)
        if (bedToUpdate) {
          await prisma.bed.update({
            where: { id: bedToUpdate.id },
            data: {
              status: admission.status === "discharged" ? "available" : "occupied",
              patientId: admission.status === "discharged" ? null : admission.patientId,
            },
          })
        }
      } catch (error) {
        console.error(`❌ Error with admission ${admission.admissionNumber}:`, error)
      }
    }

    console.log(`✅ Created ${admissionsData.length} patient admissions`)

    // Step 10: Create doctor ratings
    console.log("\n⭐ Step 10: Creating doctor ratings...")
    const doctorRatingsData: DoctorRating[] = []

    const doctorIds = staffByRole.get("DO") || []
    for (const doctorId of doctorIds) {
      // Each doctor gets 1-5 ratings
      const numRatings = randomInt(1, 5)

      for (let i = 0; i < numRatings; i++) {
        const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
        const rating = randomDecimal(1.0, 5.0) // 1.0 to 5.0
        const isAnonymous = Math.random() < 0.3 ? 1 : 0

        doctorRatingsData.push({
          patientId,
          doctorId,
          rating,
          review: `Review for doctor from patient ${patientIds.indexOf(patientId) + 1}`,
          isAnonymous,
          isVisible: 1,
        })
      }
    }

    for (const rating of doctorRatingsData) {
      try {
        await prisma.doctorRating.create({
          data: {
            id: createId(),
            patientId: rating.patientId,
            doctorId: rating.doctorId,
            rating: rating.rating,
            review: rating.review,
            isAnonymous: rating.isAnonymous,
            isVisible: rating.isVisible,
          },
        })
      } catch (error) {
        console.error(`❌ Error with doctor rating:`, error)
      }
    }

    console.log(`✅ Created ${doctorRatingsData.length} doctor ratings`)

    // Step 11: Create service ratings
    console.log("\n⭐ Step 11: Creating service ratings...")
    const serviceRatingsData: ServiceRating[] = []

    for (const [deptCode, deptId] of departmentMap.entries()) {
      // Each department gets 1-3 ratings
      const numRatings = randomInt(1, 3)

      for (let i = 0; i < numRatings; i++) {
        const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
        const rating = randomDecimal(1.0, 5.0) // 1.0 to 5.0
        const isAnonymous = Math.random() < 0.3 ? 1 : 0

        serviceRatingsData.push({
          patientId,
          departmentId: deptId,
          serviceType: `${deptCode} Service`,
          rating,
          review: `Review for ${deptCode} department from patient ${patientIds.indexOf(patientId) + 1}`,
          isAnonymous,
          isVisible: 1,
        })
      }
    }

    for (const rating of serviceRatingsData) {
      try {
        await prisma.serviceRating.create({
          data: {
            id: createId(),
            patientId: rating.patientId,
            departmentId: rating.departmentId,
            serviceType: rating.serviceType,
            rating: rating.rating,
            review: rating.review,
            isAnonymous: rating.isAnonymous,
            isVisible: rating.isVisible,
          },
        })
      } catch (error) {
        console.error(`❌ Error with service rating:`, error)
      }
    }

    console.log(`✅ Created ${serviceRatingsData.length} service ratings`)

    // Step 12: Create housekeeping tasks
    console.log("\n🧹 Step 12: Creating housekeeping tasks...")
    const housekeepingTasksData: HousekeepingTask[] = []

    // Get all ward IDs
    const wardIds = Array.from(wardMap.values())

    // Generate daily cleaning tasks for each ward
    const taskDate = new Date(START_DATE)
    while (taskDate < END_DATE) {
      for (const wardId of wardIds) {
        const cleaningStaffIds = staffByRole.get("CL") || []
        const nurseIds = staffByRole.get("NR") || []
        const adminIds = staffByRole.get("AD") || []

        // Morning cleaning
        const morningTaskDate = new Date(taskDate)
        morningTaskDate.setHours(8, 0, 0)

        const morningStartTime = new Date(taskDate)
        morningStartTime.setHours(8, 15, 0)

        const morningCompletionTime = new Date(taskDate)
        morningCompletionTime.setHours(9, 30, 0)

        const morningVerificationTime = new Date(taskDate)
        morningVerificationTime.setHours(10, 0, 0)

        housekeepingTasksData.push({
          taskType: "Cleaning",
          locationType: "Ward",
          priority: "normal",
          status: "completed",
          scheduledTime: morningTaskDate,
          startTime: morningStartTime,
          completionTime: morningCompletionTime,
          verificationTime: morningVerificationTime,
          notes: `Regular morning cleaning of ward`,
          locationId: wardId,
          assignedToId: cleaningStaffIds[Math.floor(Math.random() * cleaningStaffIds.length)],
          verifiedById: nurseIds[Math.floor(Math.random() * nurseIds.length)],
          createdById: adminIds[Math.floor(Math.random() * adminIds.length)],
        })

        // Evening cleaning
        const eveningTaskDate = new Date(taskDate)
        eveningTaskDate.setHours(18, 0, 0)

        const eveningStartTime = new Date(taskDate)
        eveningStartTime.setHours(18, 15, 0)

        const eveningCompletionTime = new Date(taskDate)
        eveningCompletionTime.setHours(19, 30, 0)

        const eveningVerificationTime = new Date(taskDate)
        eveningVerificationTime.setHours(20, 0, 0)

        housekeepingTasksData.push({
          taskType: "Cleaning",
          locationType: "Ward",
          priority: "normal",
          status: "completed",
          scheduledTime: eveningTaskDate,
          startTime: eveningStartTime,
          completionTime: eveningCompletionTime,
          verificationTime: eveningVerificationTime,
          notes: `Regular evening cleaning of ward`,
          locationId: wardId,
          assignedToId: cleaningStaffIds[Math.floor(Math.random() * cleaningStaffIds.length)],
          verifiedById: nurseIds[Math.floor(Math.random() * nurseIds.length)],
          createdById: adminIds[Math.floor(Math.random() * adminIds.length)],
        })
      }

      // Move to next day
      taskDate.setDate(taskDate.getDate() + 1)
    }

    for (const task of housekeepingTasksData) {
      try {
        await prisma.housekeepingTask.create({
          data: {
            id: createId(),
            taskType: task.taskType,
            locationType: task.locationType,
            priority: task.priority,
            status: task.status,
            scheduledTime: task.scheduledTime,
            startTime: task.startTime,
            completionTime: task.completionTime,
            verificationTime: task.verificationTime,
            notes: task.notes,
            locationId: task.locationId,
            assignedToId: task.assignedToId,
            verifiedById: task.verifiedById,
            createdById: task.createdById,
          },
        })
      } catch (error) {
        console.error(`❌ Error with housekeeping task:`, error)
      }
    }

    console.log(`✅ Created ${housekeepingTasksData.length} housekeeping tasks`)

    // Step 13: Create shift swap requests
    console.log("\n🔄 Step 13: Creating shift swap requests...")
    const shiftSwapRequestsData: ShiftSwapRequest[] = []

    // Generate a few shift swap requests
    for (let i = 0; i < 10; i++) {
      const requesterRole = Math.random() < 0.7 ? "NR" : "DO"
      const requesterIds = staffByRole.get(requesterRole) || []
      const requesterId = requesterIds[Math.floor(Math.random() * requesterIds.length)]

      // Find another staff of the same role
      let swapWithId
      do {
        swapWithId = requesterIds[Math.floor(Math.random() * requesterIds.length)]
      } while (swapWithId === requesterId)

      const requestDate = randomDate(START_DATE, END_DATE)
      const shiftDate = new Date(requestDate)
      shiftDate.setDate(shiftDate.getDate() + randomInt(1, 7)) // 1-7 days in the future

      const shifts = ["morning", "afternoon", "night"]
      const requestedShift = shifts[Math.floor(Math.random() * shifts.length)]

      const status = ["pending", "accepted", "rejected"][Math.floor(Math.random() * 3)]

      shiftSwapRequestsData.push({
        requesterId,
        swapWithId: status === "pending" ? undefined : swapWithId,
        shiftDate,
        requestedShift,
        status: status as "pending" | "accepted" | "rejected",
      })
    }

    for (const request of shiftSwapRequestsData) {
      try {
        await prisma.shiftSwapRequest.create({
          data: {
            id: createId(),
            requesterId: request.requesterId,
            swapWithId: request.swapWithId,
            shiftDate: request.shiftDate,
            requestedShift: request.requestedShift,
            status: request.status,
          },
        })
      } catch (error) {
        console.error(`❌ Error with shift swap request:`, error)
      }
    }

    console.log(`✅ Created ${shiftSwapRequestsData.length} shift swap requests`)

    // Step 14: Create resignation requests
    console.log("\n📝 Step 14: Creating resignation requests...")
    const resignationRequestsData: ResignationRequest[] = []

    // Generate a few resignation requests
    for (let i = 0; i < 3; i++) {
      const roles = ["NR", "DO", "RC", "CL"]
      const role = roles[Math.floor(Math.random() * roles.length)]
      const staffIds = staffByRole.get(role) || []
      const staffId = staffIds[Math.floor(Math.random() * staffIds.length)]

      const status = ["pending", "accepted", "rejected"][Math.floor(Math.random() * 3)]

      resignationRequestsData.push({
        staffId,
        reason: `Resignation reason ${i + 1}`,
        status: status as "pending" | "accepted" | "rejected",
      })
    }

    for (const request of resignationRequestsData) {
      try {
        await prisma.resignationRequest.create({
          data: {
            id: createId(),
            staffId: request.staffId,
            reason: request.reason,
            status: request.status,
          },
        })
      } catch (error) {
        console.error(`❌ Error with resignation request:`, error)
      }
    }

    console.log(`✅ Created ${resignationRequestsData.length} resignation requests`)

    console.log("\n✅ Database initialization completed successfully!")
    console.log("\n📝 Default Login Credentials:")
    console.log("----------------------------")

    // Print credentials for the first user of each role
    for (const [roleCode, staffIds] of staffByRole.entries()) {
      if (staffIds.length > 0) {
        const user = await prisma.user.findUnique({
          where: { id: staffIds[0] },
          select: { email: true, firstName: true, lastName: true },
        })
        if (user) {
          console.log(`${roleCode}: ${user.email} / ${roleCode.toLowerCase()}123`)
        }
      }
    }

    console.log("Patient (PA): patient1@example.com / patient123")
    console.log("\nYou can now start the application with: npm run dev")
  } catch (error) {
    console.error("\n❌ Database initialization failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

