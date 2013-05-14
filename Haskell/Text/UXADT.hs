----------------------------------------------------------------
--
-- UXADT
-- 
-- Text/UXADT.hs
--   Universal (cross-language) extensible representation for
--   algebraic data type instances.

----------------------------------------------------------------
-- 

module Text.UXADT
  where

import Data.String.Utils (join)

----------------------------------------------------------------
-- Data type definition.

type Variable = String
type Constructor = String

data UXADT =
    I Int
  | F Float
  | D Double
  | S String
  | V Variable
  | C Constructor [UXADT]
  | L [UXADT]
  | None
  deriving  (Eq)

class ToUXADT a where
  uxadt :: a -> UXADT

----------------------------------------------------------------
-- Default membership in ToUXADT.

instance ToUXADT Int where
  uxadt = I

instance ToUXADT Float where
  uxadt = F

instance ToUXADT Double where
  uxadt = D

instance ToUXADT a => ToUXADT [a] where
  uxadt l = L $ map uxadt l

instance ToUXADT a => ToUXADT (Maybe a) where
  uxadt m = maybe None uxadt m

----------------------------------------------------------------
-- Conversion to Javascript in ASCII string representation.

instance Show UXADT where
  show u = to "" u where
    to ind u = case u of
      I i    -> show i
      F f    -> show f
      D d    -> show d
      S s    -> "\"" ++ s ++ "\""
      V v    -> "uxadt.V(\"" ++ v ++ "\")"
      C c us -> "uxadt.C(\"" ++ c ++ "\", [" ++ join ", " [show u | u <- us] ++ "])"
      L   us -> "[" ++ join ", " [show u | u <- us] ++ "]"
      None   -> "uxadt.None"

----------------------------------------------------------------
-- Other useful functions.

javaScriptModule :: String -> UXADT -> String
javaScriptModule name u = 
  "var " ++ name ++ " = (function(){return " ++ show u ++ ";})();"

--eof
