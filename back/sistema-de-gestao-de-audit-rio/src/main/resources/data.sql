CREATE SCHEMA IF NOT EXISTS gestao_auditorio;


INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES
    (
        '58a5bfab-eacd-49e9-b1b3-58f43b954056',
        '12345654789098',
        'company@email.com',
        'company',
     true
    );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES
    (
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        '12349854789098',
        'company2@email.com',
        'company2',
        false
    );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES
    (
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        '97671289000102',
        'Laranja@email.com',
        'Laranja',
        false
    );

INSERT INTO company_hours_quota (company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
                                 company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking,
                                 max_monthly_hours_meeting_room)
VALUES
    (
             '38a83e3e-3efe-44fe-8615-9aa5ea935f8b',
             20,
             0,
             2,
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             12,
             12,
             12
    );

INSERT INTO company_hours_quota (company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
                                 company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking,
                                 max_monthly_hours_meeting_room)
VALUES
    (
        'e992171c-2ba9-4326-b2f8-ec0228fea71c',
        20,
        0,
        2,
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        12,
        12,
        12
    );

-- INSERT INTO monthly_usage_company_hours (monthly_usage_company_hours_id, usage_month, used_hours, venue_type, company_id
-- ) VALUES
--       ('a1b2c3d4-e5f6-4789-9012-345678901234', '2024-07-01', 0.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55'),
--       ('b2c3d4e5-f6a7-4890-1234-567890123456', '2024-07-01', 0.0, 'MEETING_ROOM', 'db72b375-bd1b-4257-91ca-040fdd807f55'),
--       ('c3d4e5f6-a7b8-4901-2345-678901234567', '2024-07-01', 0.0, 'COWORKING', 'db72b375-bd1b-4257-91ca-040fdd807f55');
--
-- INSERT INTO monthly_usage_company_hours (monthly_usage_company_hours_id, month, used_hours, venue_type, company_id)
-- VALUES (
--              'a1b2c3d4-e5f6-4789-9012-345678901234',
--              '2024-07-01',
--              5.5,
--              'AUDITORIUM',
--              'db72b375-bd1b-4257-91ca-040fdd807f55'
--          );
--
-- INSERT INTO monthly_usage_company_hours (monthly_usage_company_hours_id, month, used_hours, venue_type, company_id)
-- VALUES (
--              'b2c3d4e5-f6a7-4890-1234-567890123456',
--              '2024-07-01',
--              3.25,
--              'MEETING_ROOM',
--              'db72b375-bd1b-4257-91ca-040fdd807f55'
--          );
--
-- INSERT INTO monthly_usage_company_hours (monthly_usage_company_hours_id, month, used_hours, venue_type, company_id)
-- VALUES (
--              'c3d4e5f6-a7b8-4901-2345-678901234567',
--              '2024-07-01',
--              8.0,
--              'COWORKING',
--              'db72b375-bd1b-4257-91ca-040fdd807f55'
--          );

INSERT INTO accessibility (accessibility_id, access_ramp, elevator, accessible_bathroom, accessible_parking,
                           directional_tactile_flooring, braille_signage, audio_guidance_system)
VALUES
    (
        'edb026ef-09c2-4d0a-9cf2-9318bb84ca50',
        true,
        true,
     true,
     true,
     true,
     true,
     true
    );

INSERT INTO venues (venue_id, name, capacity, size, image, minimum_hours_to_cancel, parking, accessibility_id, venue_type,
                    divisible, maximum_months, cancellation_deadline_hours)
VALUES
    (
        '90f84536-4eee-4a69-a37f-b31d425741fa',
        'Auditório',
        500,
        300.0,
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0BV_BHQcPsYplnEKvzTSwVTOHxUUL0PIqldFatWNwPw&s=10',
        96,
        true,
        'edb026ef-09c2-4d0a-9cf2-9318bb84ca50',
        'AUDITORIUM',
        true,
        6,
        96
    );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           'ee5d931a-83e1-49be-946a-1c3b3c920c79',
           '90f84536-4eee-4a69-a37f-b31d425741fa',
           'Sala A',
           100,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           'faf2bab0-f8b6-4e80-955d-20e5d2c9d209',
           '90f84536-4eee-4a69-a37f-b31d425741fa',
           'Sala B',
           150,
           6
       );


INSERT INTO venues (venue_id, name, capacity, size, image, parking, accessibility_id, venue_type, divisible, maximum_months,
                    minimum_hours_to_cancel, cancellation_deadline_hours)
VALUES (
           'f5867870-52c3-4e78-885a-6618540a28a9',
           'Sala de Reuniões',
           150,
           '10x10',
           'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjPc8JfqLNok1mINd5px27HfqV3n29W6agln-2Lx7vwA&s=10',
           true,
           'edb026ef-09c2-4d0a-9cf2-9318bb84ca50',
           'MEETING_ROOM',
           false,
           6,
           96,
           96
       );

INSERT INTO venues (venue_id, name, capacity, size, image, parking, accessibility_id, venue_type, divisible, maximum_months,
                    minimum_hours_to_cancel, cancellation_deadline_hours)
VALUES (
           '8b0f54ee-3108-45d7-b082-29d16b990656',
           'Coworking',
           150,
           '10x10',
           'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSprS3ydEQRESH4-GvC7jNXoYDU-NSiuLsTeObF_Qma4w&s=10',
           true,
           'edb026ef-09c2-4d0a-9cf2-9318bb84ca50',
           'COWORKING',
           false,
           6,
           96,
           96
       );

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('87be0cbe-4b48-463d-9f6a-8921e13bfd17', 'MONDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('b3d8517b-19c4-481e-9974-5344e8d45400', 'MONDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('b55a78f0-059c-43a8-a8dc-15e3112ba551', 'TUESDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('b8e376c4-3b8f-47cc-bf85-80fd25085bd5', 'TUESDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('9a5c91a9-1aca-4c94-adba-c7a4b2a89f30', 'WEDNESDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('b94c7e71-fb5e-448d-b787-ad9cbf16beea', 'WEDNESDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('55fa86b4-3fc8-422f-8c13-ae8dc6433329', 'THURSDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('b7d012f3-3ffc-4797-8e44-ce2fe3a5843c', 'THURSDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('3800d43e-091b-4ce9-a5f6-6081df854f07', 'FRIDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('84d267a6-f520-4e08-b620-fbbb8bab6af6', 'FRIDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('14526407-771a-4255-aa69-92784848e323', 'SATURDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('6d47fcda-f9ca-4444-9c58-8f0d666aa1b4', 'SATURDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('fb25162f-bace-4815-b6e1-5b5f400f88fb', 'SUNDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('edeb9641-0eeb-47e7-884d-78e62e0bc4d7', 'SUNDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');


INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('7a51428f-189b-4789-8350-e57401c92e47', 'MONDAY', '08:00:00', '22:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('ee7256ec-0d1d-4d9f-a786-3546b9186cc1', 'TUESDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('62b26cf8-6809-44d0-900c-c8cf4bac6a8a', 'WEDNESDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('15fc1079-a519-4962-82d0-a630cd6aea1d', 'THURSDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('c1c56a6b-b5f6-4f95-8832-3c90876b8a79', 'FRIDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('47c2b4ec-fad2-4987-aa22-a188824898e9', 'SATURDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('dc7237c7-f799-4079-a090-78feb18b5558','SUNDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('31cfc4c5-fae0-47b3-b4ee-91e656c8b6d6', 'MONDAY', '08:00:00', '22:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('40fceeed-a3a2-43c7-b947-4e2549ddf958', 'TUESDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('b140bc30-0bc5-4e0d-8c39-f3182e1b89f8', 'WEDNESDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('9c2df602-0a91-4824-93ab-8a1e0792a886', 'THURSDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('fe59bee0-191c-497e-aee1-6df3a52990e4', 'FRIDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('4a2a87c7-ce06-4408-af02-b74d0fb6896b', 'SATURDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('650b562c-2eb6-499f-9ca8-970644b87a5e','SUNDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES ('550e8400-e29b-41d4-a716-446655440000',
        'username',
        'username@email.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '12345678909',
        'ADMIN',
        '58a5bfab-eacd-49e9-b1b3-58f43b954056',
        'https://picsum.photos/200/300',
        '21988881111',
        '152733620'
       );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, phone_number, rg_number)
VALUES (
        '16dea13c-abe5-4430-babf-962bf45b0af5',
        'username2',
        'username2@email.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '73121445006',
        'MANAGER',
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        '21999991111',
        '449603246'
       );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        'd7422380-82db-4255-95da-a08badfb5291',
        'collaborator',
        'collaborator@email.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '23454365478',
        'MANAGER',
     '58a5bfab-eacd-49e9-b1b3-58f43b954056',
     'https://picsum.photos/200/500',
     '21988882222',
     '112223335'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, phone_number, rg_number)
VALUES (
           'fbdc1ac5-d795-44f3-a333-9564775e92fe',
           'Laranja',
           'gestor-laranja@email.com',
           '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
           '80136692036',
           'MANAGER',
           'c94d1184-3b58-41b0-baa8-9df76de81138',
           '21909691111',
           '135717127'
       );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '6d865d20-c8af-4195-91b9-43d4443e60b6',
        'collaborator2',
        'collaborator2@email.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '80522998020',
        'COLLABORATOR',
     'db72b375-bd1b-4257-91ca-040fdd807f55',
     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0R9242B9N4E08zjo5LPVtSoG_r5vNJ8CJhUQvk3P2cw&s=10',
     '24776565434',
     '128372886'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '4cba56de-af50-46ac-950a-87d916e43a24',
        'Silva',
        'manager-laranja@email.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '34427225004',
        'MANAGER',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/500',
        '24999821441',
        '190809966'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '374aa3dc-d57c-4c68-ac59-ea7e8cbb1b7b',
        'Oliveira',
        'collaborator-laranja@email.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '78909876545',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '79972565569',
        '249470263'
    );

-- ==================================================================================
-- CENÁRIO 1: GESTOR (AUTO-APROVAÇÃO) - SALA DE REUNIÕES
-- Manager 'Laranja' agenda Sala de Reuniões.
-- Regra: Sala de Reunião NÃO usa BookingPeriod (NULL), usa horários livres.
-- Status: APPROVED + Insert na tabela Scheduling
-- ==================================================================================

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '11111111-1111-1111-1111-111111111111',
             'Reunião Diretoria Laranja',
             'Alinhamento mensal estratégico',
             '2025-11-10 14:00:00',
             '2025-11-10 16:00:00',
             '2025-11-01 10:00:00',
             'fbdc1ac5-d795-44f3-a333-9564775e92fe', -- User: Laranja
             'c94d1184-3b58-41b0-baa8-9df76de81138', -- Company: Laranja
             'f5867870-52c3-4e78-885a-6618540a28a9', -- Venue: Sala de Reuniões
             NULL,
             'APPROVED',
             'fbdc1ac5-d795-44f3-a333-9564775e92fe',
             '2024-12-01 10:00:00',
             NULL -- Null pois não é Auditório
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             'aaaa aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             'Reunião Diretoria Laranja',
             'Alinhamento mensal estratégico',
             '2025-11-10 14:00:00',
             '2025-11-10 16:00:00',
             '2024-12-01 10:00:00',
             'fbdc1ac5-d795-44f3-a333-9564775e92fe',
             'c94d1184-3b58-41b0-baa8-9df76de81138',
             'f5867870-52c3-4e78-885a-6618540a28a9',
             NULL,
             '11111111-1111-1111-1111-111111111111',
             NULL
         );

-- ==================================================================================
-- CENÁRIO 2: COLABORADOR (PENDENTE) - COWORKING
-- Colaborador 'Oliveira' pede Coworking.
-- Regra: Coworking NÃO usa BookingPeriod (NULL).
-- Status: PENDING (Só na tabela Request)
-- ==================================================================================

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '22222222-2222-2222-2222-222222222222',
             'Brainstorming Equipe',
             'Uso das mesas para dinâmica de grupo',
             '2024-12-12 09:00:00',
             '2024-12-12 11:00:00',
             '2024-12-02 14:30:00',
             '374aa3dc-d57c-4c68-ac59-ea7e8cbb1b7b', -- User: Oliveira
             'c94d1184-3b58-41b0-baa8-9df76de81138', -- Company: Laranja
             '8b0f54ee-3108-45d7-b082-29d16b990656', -- Venue: Coworking
             NULL,
             'PENDING',
             NULL,
             NULL,
             NULL -- Null pois não é Auditório
         );

-- ==================================================================================
-- CENÁRIO 3: COLABORADOR (APROVADO) - AUDITÓRIO (MANHÃ)
-- Colaborador 'collaborator2' pede Auditório (Sala A).
-- Regra: Auditório OBRIGA BookingPeriod. Vamos usar 'MORNING'.
-- Status: APPROVED (Nas duas tabelas)
-- ==================================================================================

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '33333333-3333-3333-3333-333333333333',
             'Treinamento Java',
             'Workshop técnico',
             '2024-12-15 08:00:00', -- Ajustado para inicio padrão da manhã
             '2024-12-15 12:00:00', -- Ajustado para fim padrão da manhã
             '2024-11-20 09:00:00',
             '6d865d20-c8af-4195-91b9-43d4443e60b6', -- User: collaborator2
             'db72b375-bd1b-4257-91ca-040fdd807f55', -- Company: company2
             '90f84536-4eee-4a69-a37f-b31d425741fa', -- Venue: Auditório
             'ee5d931a-83e1-49be-946a-1c3b3c920c79', -- SubVenue: Sala A
             'APPROVED',
             'fa89de52-3410-4378-933a-b0c42349c07f', -- User: username2 (Manager)
             '2024-11-20 10:00:00',
             'MORNING' -- Enum Válido
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
             'Treinamento Java',
             'Workshop técnico',
             '2024-12-15 08:00:00',
             '2024-12-15 12:00:00',
             '2024-11-20 10:00:00',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '90f84536-4eee-4a69-a37f-b31d425741fa',
             'ee5d931a-83e1-49be-946a-1c3b3c920c79',
             '33333333-3333-3333-3333-333333333333',
             'MORNING'
         );

-- ==================================================================================
-- CENÁRIO 4: COLABORADOR (REJEITADO) - AUDITÓRIO (TARDE)
-- CORREÇÃO: Trocado 'NIGHT' por 'AFTERNOON' para respeitar o Enum do DB.
-- Colaborador 'Oliveira' tenta agendar tarde de Natal.
-- Status: REJECTED (Só na tabela Request)
-- ==================================================================================

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, rejection_reason, booking_period
) VALUES (
             '44444444-4444-4444-4444-444444444444',
             'Festa de Natal',
             'Confraternização da empresa',
             '2024-12-25 14:00:00', -- Ajustado para horário da Tarde (conforme Factory)
             '2024-12-25 18:00:00', -- Ajustado para horário da Tarde
             '2024-11-15 10:00:00',
             '6d865d20-c8af-4195-91b9-43d4443e60b6', -- User: Oliveira
             'db72b375-bd1b-4257-91ca-040fdd807f55', -- Company: Laranja
             '90f84536-4eee-4a69-a37f-b31d425741fa', -- Venue: Auditório
             NULL,
             'REJECTED',
             '4cba56de-af50-46ac-950a-87d916e43a24', -- User: Silva (Manager)
             '2024-11-15 11:00:00',
             'A empresa não funcionará no feriado de Natal.',
             'AFTERNOON' -- Agora usa um valor permitido pelo Enum
         );

-- 1. POPULAR O GRÁFICO DE BARRAS (Histórico)
-- Inserindo dados de uso para a empresa 'Laranja' (c94d1184-3b58-41b0-baa8-9df76de81138)
-- Assumindo que 'HOJE' é final de 2024 ou 2025, ajustamos as datas para meses recentes

INSERT INTO monthly_usage_company_hours (monthly_usage_company_hours_id, usage_month, used_hours, venue_type, company_id, updated_at)
VALUES
    -- Mês Atual (Exemplo)
    ('20e2d649-a7b1-4056-bf04-f5fcc13271a6', '2025-11-01', 12.5, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),
    ('cc9b38c1-158e-4b84-83a7-4dc0fe79d829', '2025-11-01', 4.0, 'MEETING_ROOM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- Mês Passado
    ('16d86dd8-d837-424b-9dc0-6a9cf29e497a', '2025-10-01', 8.0, 'COWORKING', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),
    ('64547d90-d53e-4cf2-b834-c4bd3e4ba34e', '2025-10-01', 10.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- 2 Meses atrás
    ('8c15b583-e2a1-439e-af1b-6c397a9bdbf8', '2025-09-01', 15.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW());


-- 2. ATUALIZAR O GRÁFICO DE PIZZA (Orçamento Atual)
-- Vamos simular que a empresa Laranja já gastou 14 horas das 20 disponíveis

UPDATE company_hours_quota
SET consumed_hours = 14.0
WHERE company_id = '4466709c-f7a1-4c24-8f4c-a77ca2c1d755';
-- ID da empresa Laranja