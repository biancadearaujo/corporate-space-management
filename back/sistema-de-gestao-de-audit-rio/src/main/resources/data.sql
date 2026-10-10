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
        'contato@krypton.com',
        'Krypton',
        false
    );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES
    (
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        '97671289000102',
        'contato@zenite.com',
        'Zênite',
        false
    );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES (
           'c84cf63a-0550-48dc-afea-ef1d2915630a',
           '77823651000106',
           'contato@vortex.com',
           'Vórtex',
           false
       );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES (
           '164208db-090a-4e2a-98ff-4991813f3e50',
           '92436827000160',
           'contato@prisma.com',
           'Prisma',
           false
       );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES (
           'a1e299f1-41a7-40b2-bc45-464694bd0b31',
           '29622927000145',
           'contato@aton.com',
           'Áton',
           false
       );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES (
           'dcdd5df9-65dd-44a8-846f-e2ff4ec45a32',
           '69518708000135',
           'contato@neutron.com',
           'Nêutron',
           false
       );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES (
           'aba83137-48cf-4bf4-969b-52fc1de7d07c',
           '13113701000189',
           'contato@quasar.com',
           'Quasar',
           true
       );

INSERT INTO companies (company_id, cnpj, email, name, deleted)
VALUES (
           'c12abd59-cafc-4af9-ba38-7f864b6566b2',
           '83410345000140',
           'contato@eter .com',
           'Éter',
           true
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

INSERT INTO company_hours_quota (
    company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
    company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking, max_monthly_hours_meeting_room
)
VALUES (
           'aca8547c-7236-4a7c-897a-6c364848a28d',
           20,
           0,
           0,
           'c84cf63a-0550-48dc-afea-ef1d2915630a',
           12, 12, 12
       );

INSERT INTO company_hours_quota (
    company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
    company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking, max_monthly_hours_meeting_room
)
VALUES (
           '12076b5c-31b7-4e12-98ff-035132014ee9',
           40,
           0,
           2,
           '164208db-090a-4e2a-98ff-4991813f3e50',
           20, 20, 20
       );

INSERT INTO company_hours_quota (
    company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
    company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking, max_monthly_hours_meeting_room
)
VALUES (
           'f74ba4a6-3a2d-44fb-8792-6acbcf9086da',
           40,
           0,
           2,
           'a1e299f1-41a7-40b2-bc45-464694bd0b31',
           20, 20, 20
       );

INSERT INTO company_hours_quota (
    company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
    company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking, max_monthly_hours_meeting_room
)
VALUES (
           '62500969-d28c-4f28-90f3-2895d189197a',
           40,
           0,
           2,
           'dcdd5df9-65dd-44a8-846f-e2ff4ec45a32',
           20, 20, 20
       );

INSERT INTO company_hours_quota (
    company_hours_quota_id, monthly_limit_hours, consumed_hours, additional_hours_approved,
    company_id, max_monthly_hours_auditorium, max_monthly_hours_coworking, max_monthly_hours_meeting_room
)
VALUES (
           '8b441084-67a7-48ee-a77b-6361d05b7d87',
           40,
           0,
           2,
           'c12abd59-cafc-4af9-ba38-7f864b6566b2',
           20, 20, 20
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
        'Cosmos',
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
           'Fissão',
           100,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           'faf2bab0-f8b6-4e80-955d-20e5d2c9d209',
           '90f84536-4eee-4a69-a37f-b31d425741fa',
           'Fusão',
           150,
           6
       );

INSERT INTO venues (venue_id, name, capacity, size, image, minimum_hours_to_cancel, parking, accessibility_id, venue_type,
                    divisible, maximum_months, cancellation_deadline_hours)
VALUES
    (
        '0ad862a7-360e-4290-bfcd-673fb7a56a84',
        'Supernova',
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
           '9f309d65-e1e7-4c22-8aba-b5b4907100e5',
           '0ad862a7-360e-4290-bfcd-673fb7a56a84',
           'Nebulosa',
           100,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           '3a3c9936-9bea-40f3-95d9-61cd4754e277',
           '0ad862a7-360e-4290-bfcd-673fb7a56a84',
           'Eclipse',
           150,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           '03a36bc2-35bd-4587-91e9-5201905e658f',
           '0ad862a7-360e-4290-bfcd-673fb7a56a84',
           'Aurora',
           100,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           '6e7bf7be-5450-4496-9437-9e5c270557d5',
           '0ad862a7-360e-4290-bfcd-673fb7a56a84',
           'Cometa',
           150,
           6
       );

INSERT INTO venues (venue_id, name, capacity, size, image, minimum_hours_to_cancel, parking, accessibility_id, venue_type,
                    divisible, maximum_months, cancellation_deadline_hours)
VALUES
    (
        '76d55009-d3d4-4d27-b606-a3f5ef24ae6d',
        'Horizonte',
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
           '9eb5be07-3e08-42cf-bf97-8c07f11dde19',
           '76d55009-d3d4-4d27-b606-a3f5ef24ae6d',
           'Singularidade',
           100,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           '48f1b2a6-e3d4-46da-92f8-184631df1b36',
           '76d55009-d3d4-4d27-b606-a3f5ef24ae6d',
           'Dualidade',
           150,
           6
       );

INSERT INTO venues (venue_id, name, capacity, size, image, minimum_hours_to_cancel, parking, accessibility_id, venue_type,
                    divisible, maximum_months, cancellation_deadline_hours)
VALUES
    (
        '4d51b9c7-d298-4149-8a7f-ea955d6d89a1',
        'Prisma',
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
           '4d6313ff-9447-4562-acce-f4d6c9a5797b',
           '4d51b9c7-d298-4149-8a7f-ea955d6d89a1',
           'Raio',
           100,
           6
       );

INSERT INTO sub_venues (sub_venue_id, venue_id, name, capacity, maximum_months)
VALUES (
           '02b9142d-8a68-472e-9b08-35ae8357068d',
           '4d51b9c7-d298-4149-8a7f-ea955d6d89a1',
           'Feixe',
           150,
           6
       );

INSERT INTO venues (venue_id, name, capacity, size, image, parking, accessibility_id, venue_type, divisible, maximum_months,
                    minimum_hours_to_cancel, cancellation_deadline_hours)
VALUES (
           'f5867870-52c3-4e78-885a-6618540a28a9',
           'Vetor',
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
           '5258392d-bdaa-481f-a76d-28fea39d8de8',
           'Zodíaco',
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
           'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751',
           'Ápex',
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
           'ea30b5cc-8193-4cdc-b591-fa01e7c7aa24',
           'Frequência',
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
           '6e91a5f7-b5a3-425d-a2da-51ffc70600ea',
           'Matriz',
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
           'Fusão',
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

INSERT INTO venues (venue_id, name, capacity, size, image, parking, accessibility_id, venue_type, divisible, maximum_months,
                    minimum_hours_to_cancel, cancellation_deadline_hours)
VALUES (
           'b8b09ef4-9e0d-4496-81a0-e5cc86938baa',
           'Cinética',
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

INSERT INTO venues (venue_id, name, capacity, size, image, parking, accessibility_id, venue_type, divisible, maximum_months,
                    minimum_hours_to_cancel, cancellation_deadline_hours)
VALUES (
           '82b4d364-8408-4380-a058-c4d6fbdcb0db',
           'Plasma',
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

INSERT INTO venues (venue_id, name, capacity, size, image, parking, accessibility_id, venue_type, divisible, maximum_months,
                    minimum_hours_to_cancel, cancellation_deadline_hours)
VALUES (
           'ccf2cd31-5ade-4f31-997f-4c0b741a0b81',
           'Gravidade',
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

-- Auditório - Cosmos
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('87be0cbe-4b48-463d-9f6a-8921e13bfd17', 'MONDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('a9ec08ab-fb73-44cd-822b-f19e6a0d176c', 'MONDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('b55a78f0-059c-43a8-a8dc-15e3112ba551', 'TUESDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('c9e9c650-0a08-44dc-969f-ec5c13abd00e', 'TUESDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

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
    ('85de47cd-28eb-4837-a4d0-4501de0eb21c', 'SUNDAY', '07:00:00', '12:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa'),
    ('ee3d9061-e420-43ea-a4e4-61d62ecb71de', 'SUNDAY', '14:00:00', '22:00:00', '90f84536-4eee-4a69-a37f-b31d425741fa');

-- Auditório - Supernova

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('c1bc5ada-36e3-44fa-9388-f920b955f274', 'MONDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('fce66341-1605-41f1-8732-760e96bf250e', 'MONDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('89935773-7d22-4445-b99e-12ae346ee9ea', 'TUESDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('86917156-ca1c-4d63-9a55-5a681229a3c3', 'TUESDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('4489973d-4b48-4df5-ad30-eb13896422d1', 'WEDNESDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('885cabec-60c7-4bc3-af64-a44ef17329c0', 'WEDNESDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('675f17fe-bd81-4d1a-90da-ccd4fd115f38', 'THURSDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('fcbc38b3-b33b-435a-9924-59bfdaa86cdf', 'THURSDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('f0d029cd-444d-40d5-9fe6-3dec02d096d0', 'FRIDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('5727d025-d361-4603-a034-695e840011db', 'FRIDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('b35b2b99-4d71-447f-9af0-80ef50f6dc1a', 'SATURDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('63def509-6691-44c5-8c45-a83c3b585548', 'SATURDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('190407c3-fe9e-4298-ab4a-574092520154', 'SUNDAY', '07:00:00', '12:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84'),
    ('25b2a8ec-89f0-4524-b45d-737dec24e967', 'SUNDAY', '14:00:00', '22:00:00', '0ad862a7-360e-4290-bfcd-673fb7a56a84');

-- Auditório - Horizonte
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('44fde096-b793-4206-acd6-64ff6681f128', 'MONDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('f3e15374-d07d-44b3-9dca-9c98e5b4e7db', 'MONDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('9d812ccf-071e-4338-8e6e-9b5eb8c26561', 'TUESDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('79f8c234-2893-4aee-9eec-58e2926c6f7b', 'TUESDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('1c3451b4-29b3-4024-940a-edbccced7aa6', 'WEDNESDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('ff643409-1af2-4b20-900a-351ae0317174', 'WEDNESDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('cc19b679-80d1-4078-a26d-3276f89211e3', 'THURSDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('92b78b42-0d34-4084-a6fe-7921401f14bb', 'THURSDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0900351d-f593-4893-b631-824009178afc', 'FRIDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('3c2c3378-eb64-4400-9209-17db76894451', 'FRIDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0fdcaa9e-f87d-4b9b-bb74-11e9f53102ae', 'SATURDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('07dfcbbe-1233-4cc5-87da-daba01d875a2', 'SATURDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('8a6e08cc-f2fe-451e-9fe1-dabe21baf6aa', 'SUNDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('e6d8c89d-8d28-4ebf-be5b-4c3b9d1bcbd1', 'SUNDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

-- Auditório - Prisma
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('efdc5b0e-71a7-4d87-962d-60ae236bdd3a', 'MONDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('b3d8517b-19c4-481e-9974-5344e8d45400', 'MONDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('e8f8818b-d29e-4826-a40b-790f190ae7f8', 'TUESDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('b8e376c4-3b8f-47cc-bf85-80fd25085bd5', 'TUESDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0bb2e008-55d2-4e35-aca3-74be6cc87ac8', 'WEDNESDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('5a4c5130-be34-4116-a8cc-5a8fcf53532f', 'WEDNESDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0d17769b-1ce3-4c1c-8df8-4d76b820877b', 'THURSDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('904a6523-90e2-4bdc-b1b9-d30f3469d83c', 'THURSDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('144f5196-03c3-49cd-b46b-fbbcf4941ac8', 'FRIDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('48d1c09f-ce7e-4fcf-bfa1-3cc1b7708f8d', 'FRIDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('4f1e46e6-a159-459b-8e89-f7c0b3b779f6', 'SATURDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('c2b85570-3caf-4a8c-955a-450cdba78bcc', 'SATURDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('851986c5-7b3a-4f1d-aa0a-4e828224b0bc', 'SUNDAY', '07:00:00', '12:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1'),
    ('d7ace4c7-9033-4488-af06-6a8258287242', 'SUNDAY', '14:00:00', '22:00:00', '4d51b9c7-d298-4149-8a7f-ea955d6d89a1');



-- Sala de Reunião - Vetor
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('f312f5aa-0d8f-48db-873f-74c90525adb6', 'MONDAY', '08:00:00', '22:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('1c524339-cdde-4236-bddd-e881501676e5', 'TUESDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('6222322d-b5a6-4f63-be08-2af93ee4baed', 'WEDNESDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('8606f9fd-d3a0-41d7-bea4-d346a63cf04f', 'THURSDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('2d7e41c0-071d-45e5-b9e0-6f4fc64fc6a8', 'FRIDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('3c4ace5d-69fd-4dd6-a5a6-700c89e7a7f8', 'SATURDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('f81067eb-79fb-4d7d-bf8b-02bac6ce76aa','SUNDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');


-- Sala de Reunião - Zodíaco
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('97288e2d-198b-47d5-b169-404e99cb81ae', 'MONDAY', '08:00:00', '22:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('2722328f-abaa-4755-8182-c00e564c4db0', 'TUESDAY', '08:00:00', '18:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('71925f5f-5195-46d6-a892-aa8fcb377715', 'WEDNESDAY', '08:00:00', '18:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0e843f5f-9a2e-49df-8394-b6df8643de8a', 'THURSDAY', '08:00:00', '18:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('7dd87b64-f7ac-497e-b0ad-4cb50a9cc479', 'FRIDAY', '08:00:00', '18:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('1091bdd2-385b-4594-b5f3-2e80e18e79cc', 'SATURDAY', '08:00:00', '18:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('a1147f0a-978d-4384-91fd-6ceb6350ffe7','SUNDAY', '08:00:00', '18:00:00', '5258392d-bdaa-481f-a76d-28fea39d8de8');


-- Sala de Reunião - Ápex
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('56549128-cec0-4a16-af56-d72963354173', 'MONDAY', '08:00:00', '22:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('edfe63ec-397f-4a3a-a62b-bda9beb2efec', 'TUESDAY', '08:00:00', '18:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('9a1a8589-0238-41cc-bfd8-7c0d2192a027', 'WEDNESDAY', '08:00:00', '18:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('013b8d19-b53a-46db-ba4c-3f5d3e710c49', 'THURSDAY', '08:00:00', '18:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('e8a984a0-f465-4786-babb-85c9ceffa2c8', 'FRIDAY', '08:00:00', '18:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('97de89f7-c5ff-4551-ac22-6815b0292d35', 'SATURDAY', '08:00:00', '18:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('064b53bd-9d06-476f-96bd-10ca30747421','SUNDAY', '08:00:00', '18:00:00', 'ecd4fe9f-9567-41f6-a6b2-a1fdfeab2751');


-- Sala de Reunião - Frequência
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('d6713858-8695-4b36-823f-0098ec0e6cc9', 'MONDAY', '08:00:00', '22:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('5083f56a-bbd7-49d6-9bd6-a64739e93b3a', 'TUESDAY', '08:00:00', '18:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('cb2e703f-b95f-4774-b882-87810a82b59b', 'WEDNESDAY', '08:00:00', '18:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('214940c4-fb82-44dc-88ef-86505668122d', 'THURSDAY', '08:00:00', '18:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('f19dce8e-237a-40c6-b455-3ed90afe0fc6', 'FRIDAY', '08:00:00', '18:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('8704cd60-8507-48f6-b961-b5ddb438cb85', 'SATURDAY', '08:00:00', '18:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('d0ae8bd6-a360-4008-bb7d-72b9b91c2b70','SUNDAY', '08:00:00', '18:00:00', '6e91a5f7-b5a3-425d-a2da-51ffc70600ea');



-- Sala de Reunião - Matriz
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('5fd32bf2-df3b-46ce-a345-6393b6f0e03d', 'MONDAY', '08:00:00', '22:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('5449427d-bba9-4c4e-9482-d18eb774786c', 'TUESDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('04d46c73-2183-4e0f-9b21-d5ce2a9feb67', 'WEDNESDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('19bad7bf-2125-4d9c-a104-51b42ae7963a', 'THURSDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('9498d3c9-264d-4a7d-bd75-90a987abe15c', 'FRIDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('d15dcccb-93dd-4045-8019-7cde23a4bcf7', 'SATURDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0bf769f1-8f52-478a-9ad7-402f099d6df1','SUNDAY', '08:00:00', '18:00:00', 'f5867870-52c3-4e78-885a-6618540a28a9');



-- Coworking - Fusão
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('5318dda9-c92f-4dd6-bed7-1784a246313b', 'MONDAY', '08:00:00', '22:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('c6550841-5838-4a9a-8a1a-bd3c70dd04ae', 'TUESDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('892628ae-9d5b-4ec1-bfd6-e9695a8330d6', 'WEDNESDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('484007c0-433b-4cdf-940d-a98aba3e34ee', 'THURSDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('4742ddfb-afb0-458d-bddc-9d797790d625', 'FRIDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('e61a9e4b-193d-41ea-9315-4255bcf12af2', 'SATURDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('3ed8682f-5f31-4c2f-8a88-c9a2cf4a0b5f','SUNDAY', '08:00:00', '18:00:00', '8b0f54ee-3108-45d7-b082-29d16b990656');


-- Coworking - Cinética
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('a17c11f1-256d-4a20-86cf-817e08dcd47d', 'MONDAY', '08:00:00', '22:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('57aa2a44-96e7-42fb-89fc-44fa16fa831b', 'TUESDAY', '08:00:00', '18:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('ae36b4ed-90e8-4d3a-9451-de6f3752c621', 'WEDNESDAY', '08:00:00', '18:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('432ebc2e-341f-4c44-93be-86a90eeb7407', 'THURSDAY', '08:00:00', '18:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('a0a35b5a-8507-4859-9220-b8f43c12cea1', 'FRIDAY', '08:00:00', '18:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('0e17b37b-31e9-48f7-8f39-a30c64185c13', 'SATURDAY', '08:00:00', '18:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('ff3bec8c-5212-4086-9293-a5356c03e55e','SUNDAY', '08:00:00', '18:00:00', 'b8b09ef4-9e0d-4496-81a0-e5cc86938baa');


-- Coworking - Plasma
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('ac406673-7e1c-478a-a8a2-92a6190cfa54', 'MONDAY', '08:00:00', '22:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('3f7fc0df-ef5f-43cf-b6f2-2efb95b095eb', 'TUESDAY', '08:00:00', '18:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('2b110ca3-c52e-48eb-b420-8a705c275d50', 'WEDNESDAY', '08:00:00', '18:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('adddd015-c7a5-4335-919e-8fb52e672ca8', 'THURSDAY', '08:00:00', '18:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('18f2febc-49ed-4a03-b132-2e78ebbdfc62', 'FRIDAY', '08:00:00', '18:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('ec9b2131-b0c7-4d6e-a035-9cc9e070fb5e', 'SATURDAY', '08:00:00', '18:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('9fe400c4-42b0-4476-9170-c803460ebe85','SUNDAY', '08:00:00', '18:00:00', '82b4d364-8408-4380-a058-c4d6fbdcb0db');


-- Coworking - Gravidade
INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('4038bee1-b8eb-4409-8f03-3e07af1900b3', 'MONDAY', '08:00:00', '22:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('4f822b5b-eea5-49e6-a360-d77eb170e728', 'TUESDAY', '08:00:00', '18:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('b221d473-7dc7-404c-8690-2c20811bd81e', 'WEDNESDAY', '08:00:00', '18:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('b116c4cb-afc4-4a21-8d30-2743887f9b9c', 'THURSDAY', '08:00:00', '18:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('da4b8ca3-5eab-46ef-819f-4140bb0579e5', 'FRIDAY', '08:00:00', '18:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('6b26b3cb-bf78-47a1-b05d-b77332d77249', 'SATURDAY', '08:00:00', '18:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');

INSERT INTO opening_hours (opening_hours_id, day_of_week, opening_time, closing_time, venue_id)
VALUES
    ('1fd189c8-6565-4daa-8950-3467926dba51','SUNDAY', '08:00:00', '18:00:00', 'ccf2cd31-5ade-4f31-997f-4c0b741a0b81');



INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES ('550e8400-e29b-41d4-a716-446655440000',
        'Sol',
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
        'Ariel',
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
        'Zen',
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
           'Andrómeda',
           'andromeda@zenite.com',
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
        'Cora',
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
        'Gaia',
        'gaia@zenite.com',
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
        'Luna',
        'luna@zenite.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '78909876545',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '79972565569',
        '249470263'
    );

--------------------------------------------------------------------

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '6fa12217-b646-4db7-9349-33edf77e609b',
        'Lira',
        'lira@krypton.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '86555454067',
        'COLLABORATOR',
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        'https://picsum.photos/200/600',
        '2437640320',
        '244918429'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '7ae24188-65d1-44c1-a398-8d1e56c7e8dd',
        'Selene',
        'selene@krypton.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '97653217087',
        'COLLABORATOR',
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        'https://picsum.photos/200/600',
        '2233082958',
        '238963676'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '57d37af1-a1ea-4fe5-b262-71013d850e5e',
        'Altair',
        'Altair@krypton.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '25529594077',
        'COLLABORATOR',
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        'https://picsum.photos/200/600',
        '2135662383',
        '238963676'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        'b5c66572-7099-4f2a-8544-46a5d3465b0f',
        'Artur',
        'artur@krypton.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '18595649090',
        'COLLABORATOR',
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        'https://picsum.photos/200/600',
        '2123534450',
        '122559393'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '78dce930-de8a-42e6-868c-10b1b0600821',
        'Albert',
        'Albert@krypton.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '45139490072',
        'COLLABORATOR',
        'db72b375-bd1b-4257-91ca-040fdd807f55',
        'https://picsum.photos/200/600',
        '2136833677',
        '448243118'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '981df554-cfa3-4180-9ab6-f4f9d7abeef8',
        'Kelvin',
        'kelvin@zenite.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '22272143091',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '2231615678',
        '208879948'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '9ec714cf-f51d-4ea7-8d77-c66ff9825df8',
        'Sirius',
        'Sirius@zenite.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '67130487062',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '2426815464',
        '359046861'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '215af295-fec8-4fcc-8a51-5b0e2c24ced4',
        'Blas',
        'blas@zenite.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '32263240047',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '2232563300',
        '450084127'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        '983f3a53-04e4-4d07-a902-cc34c9eeb458',
        'Lira',
        'lira@zenite.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '23273390069',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '2106613730',
        '141239785'
    );

INSERT INTO users (user_id, username, email, password, cpf, role, company_id, photo_url, phone_number, rg_number)
VALUES
    (
        'f5987e52-e189-4d4f-b8e0-b611589cffbe',
        'Vega',
        'vega@zenite.com',
        '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
        '11189815028',
        'COLLABORATOR',
        'c94d1184-3b58-41b0-baa8-9df76de81138',
        'https://picsum.photos/200/600',
        '2424790737',
        '276007736'
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
             'fbdc1ac5-d795-44f3-a333-9564775e92fe',
             'c94d1184-3b58-41b0-baa8-9df76de81138',
             'f5867870-52c3-4e78-885a-6618540a28a9',
             NULL,
             'APPROVED',
             'fbdc1ac5-d795-44f3-a333-9564775e92fe',
             '2024-12-01 10:00:00',
             NULL
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
             '374aa3dc-d57c-4c68-ac59-ea7e8cbb1b7b',
             'c94d1184-3b58-41b0-baa8-9df76de81138',
             '8b0f54ee-3108-45d7-b082-29d16b990656',
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



-- MAIO DE 2026 (10 horas)
INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '1277c39f-fc78-4cbf-acc3-63a1f9f6d5fa', 'Treinamento de Equipe', 'Treinamento interno', '2026-05-15 08:00:00', '2026-05-15 18:00:00', '2026-05-01 10:00:00', '4cba56de-af50-46ac-950a-87d916e43a24', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'APPROVED', 'fbdc1ac5-d795-44f3-a333-9564775e92fe', '2026-05-02 10:00:00', NULL
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             '33cd8e6b-982b-49ea-8bbc-2fc93b8e6c0a', 'Treinamento de Equipe', 'Treinamento interno', '2026-05-15 08:00:00', '2026-05-15 18:00:00', '2026-05-01 10:00:00', '4cba56de-af50-46ac-950a-87d916e43a24', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, '1277c39f-fc78-4cbf-acc3-63a1f9f6d5fa', NULL
         );

-- JUNHO DE 2026 (5 horas)
INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '1188d44d-b07c-41ee-aa86-c6aec162a079', 'Reunião com Clientes', 'Apresentação de Produto', '2026-06-10 13:00:00', '2026-06-10 18:00:00', '2026-06-01 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'APPROVED', 'fbdc1ac5-d795-44f3-a333-9564775e92fe', '2026-06-02 10:00:00', NULL
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Reunião com Clientes', 'Apresentação de Produto', '2026-06-10 13:00:00', '2026-06-10 18:00:00', '2026-06-01 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, '1188d44d-b07c-41ee-aa86-c6aec162a079', NULL
         );

-- JULHO DE 2026 (12 horas)
INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '34df289a-bb4e-40b3-bc90-bfbe3664200a', 'Workshop', 'Workshop de Design', '2026-07-20 08:00:00', '2026-07-20 20:00:00', '2026-07-05 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'APPROVED', 'fbdc1ac5-d795-44f3-a333-9564775e92fe', '2026-07-06 10:00:00', NULL
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Workshop', 'Workshop de Design', '2026-07-20 08:00:00', '2026-07-20 20:00:00', '2026-07-05 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, '34df289a-bb4e-40b3-bc90-bfbe3664200a', NULL
         );

-- AGOSTO DE 2026 (8 horas)
INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '55555555-5555-5555-5555-555555555555', 'Planejamento Q3', 'Reunião de diretoria', '2026-08-05 09:00:00', '2026-08-05 17:00:00', '2026-08-01 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'APPROVED', 'fbdc1ac5-d795-44f3-a333-9564775e92fe', '2026-08-02 10:00:00', NULL
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Planejamento Q3', 'Reunião de diretoria', '2026-08-05 09:00:00', '2026-08-05 17:00:00', '2026-08-01 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, '55555555-5555-5555-5555-555555555555', NULL
         );

-- SETEMBRO DE 2026 (15 horas)
INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, decided_by, decided_at, booking_period
) VALUES (
             '66666666-6666-6666-6666-666666666666', 'Evento Corporativo', 'Festa da Empresa', '2026-09-15 08:00:00', '2026-09-15 23:00:00', '2026-09-01 10:00:00', '4cba56de-af50-46ac-950a-87d916e43a24', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'APPROVED', 'fbdc1ac5-d795-44f3-a333-9564775e92fe', '2026-09-02 10:00:00', NULL
         );

INSERT INTO scheduling (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_auditorium_id, register_request_id, booking_period
) VALUES (
             'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Evento Corporativo', 'Festa da Empresa', '2026-09-15 08:00:00', '2026-09-15 23:00:00', '2026-09-01 10:00:00', '4cba56de-af50-46ac-950a-87d916e43a24', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, '66666666-6666-6666-6666-666666666666', NULL
         );



-- SOLICITAÇÃO DE AGENDAMENTO P/ GERENTE
-- created_at tem que ser no máximo 72 horas antes da data atual. start_at tem que ser no mínimo 96 horas no futuro.
INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, booking_period
) VALUES (
             '77777777-7777-7777-7777-777777777777',
                 'Conferência Anual', 'Conferência', '2026-10-20 08:00:00', '2026-10-20 12:00:00', '2026-10-10 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'PENDING', NULL
         );

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, booking_period
) VALUES (
             '81e5b0a1-8591-4999-b480-a128e460599d', 'Evento Corporativo', 'Conferência', '2026-10-21 09:00:00', '2026-10-21 10:00:00', '2026-10-10 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'PENDING', NULL
         );

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, booking_period
) VALUES (
             'df0abcb1-1ead-46b3-9ae9-e30e4e304624', 'Alinhamento Semanal', 'Sincronizar tarefas da equipe', '2026-10-30 09:00:00', '2026-10-30 10:00:00', '2026-10-10 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'PENDING', NULL
         );

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, booking_period
) VALUES (
             '035f4b24-7b20-4c04-a40b-5878eacc8bf4', 'Alinhamento Técnico', 'Reunião', '2026-10-19 09:00:00', '2026-10-19 10:00:00', '2026-10-10 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'PENDING', NULL
         );

INSERT INTO scheduling_register_request (
    scheduling_id, name, description, start_at, end_at, created_at, created_by,
    id_company, id_venue, sub_venue_id, status, booking_period
) VALUES (
             'e0db37ed-ea89-4898-b90c-c9e4336956be', 'Refinamento de Tarefas', 'Reunião', '2026-10-20 09:00:00', '2026-10-20 10:00:00', '2026-10-10 10:00:00', '6d865d20-c8af-4195-91b9-43d4443e60b6', 'db72b375-bd1b-4257-91ca-040fdd807f55', 'f5867870-52c3-4e78-885a-6618540a28a9', NULL, 'PENDING', NULL
         );


-- POPULAR O GRÁFICO DE BARRAS (Histórico) -- Fluxo de Uso - Manager
INSERT INTO monthly_usage_company_hours (monthly_usage_company_hours_id, usage_month, used_hours, venue_type, company_id, updated_at)
VALUES
    -- JANEIRO DE 2026
    ('20e2d649-a7b1-4056-bf04-f5fcc13271a6', '2026-01-11', 10.5, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- FEVEREIRO DE 2026
    ('f648443d-51e9-4d7e-bb9b-fc88adda5185', '2026-02-11', 12.5, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),
    ('d096594a-429c-4223-aa4e-3b498901096c', '2026-02-12', 4.0, 'MEETING_ROOM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- MARÇO DE 2026
    ('101cae02-0bec-472a-b1c6-feb360c16523', '2026-03-12', 8.0, 'MEETING_ROOM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- ABRIL DE 2026
    ('b3e14b92-0d4b-428a-87bd-4e4df37425c2', '2026-04-01', 15.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- MAIO DE 2026
    ('4819bedc-3cd2-4e82-b77e-709678e23018', '2026-05-01', 8.0, 'COWORKING', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- JUNHO DE 2026
    ('0a79c558-229f-45ef-af01-3173a6190f7d', '2026-06-01', 10.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- JULHO DE 2026
    ('84138a97-b7ea-4336-95bd-09007487b148', '2026-07-11', 12.5, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- AGOSTO DE 2026
    ('6fe503ed-17b2-4a2f-b70d-5761011a474c', '2026-08-12', 4.0, 'MEETING_ROOM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- SETEMBRO DE 2026
    ('14135f29-2491-49ee-bcde-9c7060b84300', '2026-09-01', 15.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- OUTUBRO DE 2026
    ('3c81af34-187d-408c-9109-4973884c3415', '2026-10-01', 1.0, 'COWORKING', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),
    ('9699eb7b-e877-44b3-9338-4afb8c4f29a1', '2026-10-01', 10.0, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- NOVEMBRO DE 2025
    ('af8a1204-5abe-4ae6-a210-82c620b0e2a4', '2025-11-11', 12.5, 'AUDITORIUM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW()),

    -- DEZEMBRO DE 2025
    ('dbcab5fa-05f0-41a8-8fc5-aa0efa047d54', '2025-12-12', 4.0, 'MEETING_ROOM', 'db72b375-bd1b-4257-91ca-040fdd807f55', NOW());


-- ATUALIZAR O GRÁFICO DE PIZZA (Orçamento Atual)
-- simular que a empresa já gastou 14 horas das 20 disponíveis

UPDATE company_hours_quota
SET consumed_hours = 14.0
WHERE company_id = '4466709c-f7a1-4c24-8f4c-a77ca2c1d755';

-- 1. Exemplo de solicitação PENDENTE (Aguarda revisão do Manager)
INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status, created_at, updated_at,
                                      is_approved
) VALUES (
             'a1b2c3d4-e5f6-4789-9012-111111111111',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             10.0,
             'Precisamos de horas extras para o treinamento intensivo da nova equipe.',
             'PENDING_MANAGER_REVIEW',
             '2026-10-01 09:00:00',
             NULL,
             false
         );

INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status, created_at, updated_at,
    is_approved
) VALUES (
             'b1b47d62-c2e6-43aa-a8d5-dd3131649b3b',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             5.0,
             'Precisamos de horas extras para cumprir o prazo de entrega do novo projeto.',
             'PENDING_MANAGER_REVIEW',
             '2026-10-01 09:00:00',
             NULL,
             false
         );

INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status, created_at, updated_at,
    is_approved
) VALUES (
             '83dda4bd-e91a-4591-b54c-ad1a469d5a10',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             5.0,
             'Devido ao aumento inesperado no volume de pedidos, precisaremos programar horas extras.',
             'PENDING_MANAGER_REVIEW',
             '2026-10-01 09:00:00',
             NULL,
             false
         );

-- 2. Exemplo de solicitação APROVADA pelo Gerente
INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status,created_at, updated_at,
    is_approved
) VALUES (
             'a1b2c3d4-e5f6-4789-9012-222222222222',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             5.5,
             'Reunião emergencial com diretoria estendida.',
             'PENDING_ADMIN_REVIEW',
             '2026-10-02 14:00:00',
             '2026-10-03 10:30:00',
             false
         );

INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status,created_at, updated_at,
    is_approved
) VALUES (
             'e07a42ff-edd7-4eeb-9a85-90c95ebfb145',
             'c94d1184-3b58-41b0-baa8-9df76de81138',
             '374aa3dc-d57c-4c68-ac59-ea7e8cbb1b7b',
             5.5,
             'Estamos com uma demanda muito alta no setor, por isso vamos precisar de um esforço extra de tempo nos próximos dias.',
             'PENDING_ADMIN_REVIEW',
             '2026-10-02 14:00:00',
             '2026-10-03 10:30:00',
             false
         );

INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status,created_at, updated_at,
    is_approved
) VALUES (
             '1b3c1955-93a4-4a20-a4a8-b4b823964a54',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             5.5,
             'Estamos com uma demanda muito alta no setor, por isso vamos precisar de um esforço extra de tempo nos próximos dias.',
             'PENDING_ADMIN_REVIEW',
             '2026-10-02 14:00:00',
             '2026-10-03 10:30:00',
             false
         );

INSERT INTO additional_hours_request (
    additional_hours_request_id, company_id, requester_id, requested_hours, justification, status,created_at, updated_at,
    is_approved
) VALUES (
             '615797f0-9b20-48dd-8b97-ce71b006f530',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             '6d865d20-c8af-4195-91b9-43d4443e60b6',
             5.5,
             'Precisamos de horas extras hoje para solucionar a falha técnica no nosso sistema principal.',
             'PENDING_ADMIN_REVIEW',
             '2026-10-02 14:00:00',
             '2026-10-03 10:30:00',
             false
         );

--SOLICITAÇÃO DE REGISTRO DE USUÁRIO (PENDENTE)
INSERT INTO users_registration_request (
    id, username, email, password, cpf, photo_url, phone_number, rg_number, company_id, status, decided_by, decided_at,
    rejection_reason
) VALUES (
             'e1c12345-1234-4000-8000-000000000001',
             'Galileu',
             'galileu@krypton.com',
             '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
             '65900941019',
             'https://picsum.photos/200/300',
             '24990099111',
             '266608383',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             'PENDING',
             NULL,
             NULL,
             NULL
         );

INSERT INTO users_registration_request (
    id, username, email, password, cpf, photo_url, phone_number, rg_number, company_id, status, decided_by, decided_at,
    rejection_reason
) VALUES (
             '90004072-8f3d-4bd9-b884-086f67b2e156',
             'Astra',
             'astra@krypton.com',
             '$2a$10$GiseHkdvwOFr7A9KRWbeiOmg/PYPhWVjdm42puLfOzR/gIAQrsAGy',
             '17741413023',
             'https://picsum.photos/200/300',
             '24990099111',
             '460642996',
             'db72b375-bd1b-4257-91ca-040fdd807f55',
             'PENDING',
             NULL,
             NULL,
             NULL
         );