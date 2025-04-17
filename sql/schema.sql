BEGIN;

CREATE TABLE IF NOT EXISTS public.admin
(
    name character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    nationalid character varying COLLATE pg_catalog."default" NOT NULL,
    phone character varying COLLATE pg_catalog."default" NOT NULL,
    address character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    sex character varying COLLATE pg_catalog."default" NOT NULL,
    image character varying COLLATE pg_catalog."default" NOT NULL,
    birthdate date NOT NULL,
    CONSTRAINT admin_pkey PRIMARY KEY (email, nationalid)
);

CREATE TABLE IF NOT EXISTS public.appointment
(
    surgeonid character varying COLLATE pg_catalog."default" NOT NULL,
    patientid character varying COLLATE pg_catalog."default" NOT NULL,
    roomnumber character varying COLLATE pg_catalog."default" NOT NULL,
    "time" time without time zone NOT NULL,
    operationid bigint NOT NULL,
    appointmentid bigserial NOT NULL,
    startdate timestamp without time zone NOT NULL,
    enddate timestamp without time zone NOT NULL,
    date date NOT NULL,
    duration bigint,
    CONSTRAINT appointment_pkey PRIMARY KEY (appointmentid)
);

CREATE TABLE IF NOT EXISTS public.device
(
    name character varying COLLATE pg_catalog."default" NOT NULL,
    serialnumber character varying COLLATE pg_catalog."default" NOT NULL,
    company character varying COLLATE pg_catalog."default" NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL,
    warranty character varying COLLATE pg_catalog."default" NOT NULL,
    price character varying COLLATE pg_catalog."default" NOT NULL,
    date date NOT NULL,
    productcode character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT device_pkey PRIMARY KEY (serialnumber)
);

CREATE TABLE IF NOT EXISTS public.medicalhistory
(
    operationcode bigint NOT NULL,
    patientid character varying COLLATE pg_catalog."default" NOT NULL,
    surgeonid character varying COLLATE pg_catalog."default" NOT NULL,
    historyid bigserial NOT NULL,
    patientname character varying COLLATE pg_catalog."default" NOT NULL,
    surgeonname character varying COLLATE pg_catalog."default" NOT NULL,
    operationname character varying COLLATE pg_catalog."default" NOT NULL,
    date character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT medicalhistory_pkey PRIMARY KEY (historyid)
);

CREATE TABLE IF NOT EXISTS public.operation
(
    name character varying COLLATE pg_catalog."default" NOT NULL,
    price character varying COLLATE pg_catalog."default" NOT NULL,
    roomnumber bigint NOT NULL,
    description character varying COLLATE pg_catalog."default" NOT NULL,
    code bigserial NOT NULL,
    duration bigint NOT NULL,
    CONSTRAINT operation_pkey PRIMARY KEY (code)
);

CREATE TABLE IF NOT EXISTS public.patient
(
    name character varying COLLATE pg_catalog."default" NOT NULL,
    nationalid character varying COLLATE pg_catalog."default" NOT NULL,
    address character varying COLLATE pg_catalog."default" NOT NULL,
    phone character varying COLLATE pg_catalog."default" NOT NULL,
    sex character varying COLLATE pg_catalog."default" NOT NULL,
    image character varying COLLATE pg_catalog."default" NOT NULL,
    birthdate date NOT NULL,
    CONSTRAINT patient_pkey PRIMARY KEY (nationalid)
);

CREATE TABLE IF NOT EXISTS public.surgeon
(
    name character varying COLLATE pg_catalog."default" NOT NULL,
    nationalid character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    phone character varying COLLATE pg_catalog."default" NOT NULL,
    sex character varying COLLATE pg_catalog."default" NOT NULL,
    birthdate date NOT NULL,
    image character varying COLLATE pg_catalog."default" NOT NULL,
    speciality character varying COLLATE pg_catalog."default" NOT NULL,
    address character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT surgeon_pkey PRIMARY KEY (nationalid, email)
);

CREATE TABLE IF NOT EXISTS public.useddevice
(
    deviceproductcode character varying COLLATE pg_catalog."default" NOT NULL,
    operationcode character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT useddevice_pkey PRIMARY KEY (deviceproductcode, operationcode)
);

END;